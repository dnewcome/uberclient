using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Xml;
using System.Text.RegularExpressions;
using Ubernote.Data;
using Ubernote.Auth;

public partial class StandAlone : System.Web.UI.Page 
{
    protected string m_strVersion = ConfigurationManager.AppSettings["ubernoteVersion"];
    private string m_strCacheUpdateMode = ConfigurationManager.AppSettings["cacheUpdateMode"];
    private string m_strSubSection = ConfigurationManager.AppSettings["jsSubSection"];
    private string m_strUpdateString = "";
    private string m_strSID = "";
    private string m_strNoteID = "";

    private bool m_bPaidUser = true;    // temporary.

    protected void GetUID()
    {
        UserInfo objUserInfo = new UserInfo(HttpContext.Current);
        string strUID;

        try
        {
            strUID = objUserInfo.UserID();

        }
        catch
        {

            strUID = "Unknown";
        }
        Response.Write(strUID.ToString());
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        if (Page.IsPostBack != true)
        {
            this.m_strUpdateString = this.calcUpdateString();

            // get query strings
            string connectionString = ConfigurationManager.AppSettings["keyConn"];

            SqlConnection sqlConnection = new SqlConnection(connectionString);
            using (sqlConnection)
            {
                DatabaseHelper.OpenConnectionSafe(sqlConnection);
                Ubernote.Data.Note objNote = new Ubernote.Data.Note(sqlConnection);

                UserInfo objUserInfo = new UserInfo(HttpContext.Current);

                if (objUserInfo.Valid() == false)
                {
                    //Not authenticated.  Let's redirect them to login but to come back
                    Response.Redirect("../webtools/loginmini.aspx?logintitle=" + Page.Title.ToString() + "&page=" + Server.UrlEncode(Page.Request.Url.AbsolutePath + Request.Url.Query.ToString()));
                } // end if
                else
                {
                    this.m_strSID = objUserInfo.GetSession(true);
                } // end if


                //Check SSL

                if (System.Configuration.ConfigurationManager.AppSettings["SSL"] == "1") //SSL Enabled for site
                {

                    if ((!Request.IsSecureConnection) && // Original request is insecure
                    objUserInfo.SSLEnabled(this.m_strSID))  // User is allowed SSL
                    {
                        // send user to SSL 
                        string serverName = HttpUtility.UrlEncode(Request.ServerVariables["SERVER_NAME"]);
                        string filePath = Request.RawUrl;
                        Response.Redirect("https://" + serverName + filePath);
                    }
                    else if ((Request.IsSecureConnection) && // Original request is secure
                    !objUserInfo.SSLEnabled(this.m_strSID))  // User is not allowed
                    {
                        // send user to normal
                        string serverName = HttpUtility.UrlEncode(Request.ServerVariables["SERVER_NAME"]);
                        string filePath = Request.RawUrl;
                        Response.Redirect("http://" + serverName + filePath);
                    }

                    //Other cases just fall through and are correct
                }
            } // end using

            if (Request.QueryString["noteid"] != null)
            {
                this.m_strNoteID = Request.QueryString["noteid"].ToString();
                if( "NEW_NOTE" == this.m_strNoteID )
                {
                     this.m_strNoteID = this.createNewNote();
                } // end if
            }

            

        } // end if
       

    }

    protected void getSID()
    {
        Response.Write(this.m_strSID);
    }

    protected void getNoteID()
    {
        Response.Write(this.m_strNoteID);
    }

    protected void Version()
    {
        Response.Write( this.m_strVersion );
    }
    //Junk

    protected string calcUpdateString()
    {
        string strRetVal = DateTime.Now.Ticks.ToString();
        // The default is "ticks" in the constructor, override if necessary here.
        if (0 == this.m_strCacheUpdateMode.CompareTo("version"))
        {
            strRetVal = this.m_strVersion;
        } // end if

        return strRetVal;
    }

    protected void UpdateString()
    {   
        Response.Write(this.m_strUpdateString);
    }

    protected void includeFile( string in_strTemplate, string in_strFilename )
    {
        string strHeader = Regex.Replace( in_strTemplate, "{FILENAME}", in_strFilename );
        strHeader = Regex.Replace( strHeader, "{UPDATESTRING}", this.m_strUpdateString );
        Response.Write(strHeader);
    }

    protected void includeJavascript(string in_strFilename)
    {
        string strTemplate = "<script type='text/javascript' language='JavaScript' src='{FILENAME}?{UPDATESTRING}' ></script>\n";
        this.includeFile( strTemplate, in_strFilename );
    }

    protected void generateJavascriptHeaders(string in_strSection)
    {
        string[] astrFiles = this.getFileList(in_strSection, this.m_strSubSection);
        foreach (string strFilename in astrFiles)
        {
            this.includeJavascript(in_strSection+"/"+strFilename);
        } // end foreach
    }

    protected void includeStylesheet(string in_strFilename)
    {
        string strTemplate = "<link rel='stylesheet' type='text/css' href='{FILENAME}?{UPDATESTRING}'></link>\n";
        this.includeFile( strTemplate, in_strFilename );
    }
    
    protected void generateStylesheetHeaders(string in_strSection)
    {
        string[] astrFiles = this.getFileList(in_strSection, this.m_strSubSection);
        foreach (string strFilename in astrFiles)
        {
            this.includeStylesheet(in_strSection + "/" + strFilename);
        } // end foreach
    }

    protected string[] getFileList(string in_strSection, string in_strSubSection)
    {
        XmlDocument doc = new XmlDocument();
        doc.Load(Server.MapPath("external_includes.xml"));

        /* Get the head node of the section, then the subsections, 
         * then all the files for that subsection.
         */
        XmlElement objHead = (XmlElement)doc.GetElementsByTagName(in_strSection)[0];
        XmlElement objSubsection = (XmlElement)objHead.GetElementsByTagName(in_strSubSection)[0];
        XmlNodeList scriptList = objSubsection.GetElementsByTagName("file");
        
        int nCount = scriptList.Count;
        int nCurr = 0;

        string[] astrFiles = new string[nCount];

        foreach (XmlNode node in scriptList)
        {
            XmlElement scriptElement = (XmlElement)node;
            if (scriptElement.HasAttributes)
            {
                astrFiles[nCurr] = scriptElement.Attributes["src"].InnerText;
            } // end if
            nCurr++;
        } // end foreach

        return astrFiles;
    } // end getFileList

    /**
     * createNewNote - creates a new note.
     * @returns {String} the new noteID.
     */
    private string createNewNote()
    {
        string strRetVal = "NEW_NOTE";

		SqlConnection sqlConnection = DatabaseHelper.CreateConnection();

        using (sqlConnection)
		{
			Ubernote.Data.Note note = new Ubernote.Data.Note( sqlConnection );
			DataSet ds = note.NoteAdd( this.m_strSID, SourceType.Client, "", "" );
            strRetVal = ds.Tables["noteAdd"].Rows[0]["noteID"].ToString().ToLower();
		} // end using

        return strRetVal;
    }

    protected void includePremiumClass()
    {
        if (true == this.m_bPaidUser)
        {
            //Response.Write(" premium ");
        } // end if
    }
}
