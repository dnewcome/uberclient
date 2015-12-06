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

public partial class _Default : System.Web.UI.Page 
{
    protected string m_strVersion = ConfigurationManager.AppSettings["ubernoteVersion"];
    private string m_strCacheUpdateMode = ConfigurationManager.AppSettings["cacheUpdateMode"];
    private string m_strSubSection = ConfigurationManager.AppSettings["jsSubSection"];
    private string m_strUpdateString = "";
    private string m_strNoteID = "";

    private bool m_bPaidUser = true;    // temporary.    

    protected void Page_Load(object sender, EventArgs e)
    {
        if (Page.IsPostBack != true)
        {
            this.m_strUpdateString = this.calcUpdateString();

            UserInfo objUserInfo = new UserInfo( HttpContext.Current );

            if (objUserInfo.Valid() == true)  // At least it looks valid
            {
                string strSID = objUserInfo.GetPrimarySID();

                if (Request.QueryString["noteid"] != null)
                {
                    //Write the cookie for Dashboard page retrieval

                    if (Request.QueryString["noteid"].Length == 36)
                    {
                        HttpCookie objNote= new HttpCookie("OpenNote");
                        objNote.Value = Request.QueryString["noteid"].ToString();
                        Response.Cookies.Set(objNote);
                    }

                    Response.Redirect(Request.Path);

                }

                //Check SSL

                if (System.Configuration.ConfigurationManager.AppSettings["SSL"] == "1") //SSL Enabled for site
                {
                
                    if ((!Request.IsSecureConnection) && // Original request is insecure
                    objUserInfo.SSLEnabled(strSID))  // User is allowed SSL
                    {
                        // send user to SSL 
                        string serverName = HttpUtility.UrlEncode(Request.ServerVariables["SERVER_NAME"]);
                        string filePath = Request.RawUrl;
                        Response.Redirect("https://" + serverName + filePath);
                    }
                    else if ((Request.IsSecureConnection) && // Original request is secure
                    !objUserInfo.SSLEnabled(strSID))  // User is not allowed
                    {
                        // send user to normal
                        string serverName = HttpUtility.UrlEncode(Request.ServerVariables["SERVER_NAME"]);
                        string filePath = Request.RawUrl;
                        Response.Redirect("http://" + serverName + filePath);
                    }

                    //Other cases just fall through and are correct
                }


            }
            else // No SID
            {
                Response.Redirect("../pages/login.aspx?logintitle=UberNote&page=" + Server.UrlEncode(Page.Request.Url.AbsolutePath + Request.Url.Query.ToString()));
               
                
            }
        }
    }

    protected void GetUID()
    {
        UserInfo objUserInfo = new UserInfo(HttpContext.Current);
        string strUID = "Unknown";

        try
        {
            strUID = objUserInfo.UserID();
        }
        catch
        {
            // do nothing
        }
        Response.Write(strUID.ToString());
    }

    protected void GetMessage()
    {
        string strMessage = "Nothing";

        Response.Write(strMessage);
    }

    protected void GetNoteID()
    {
        Response.Write(this.m_strNoteID);
    }

    protected void Version()
    {
        Response.Write( this.m_strVersion );
    }

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
        string strTemplate = "";

        if( "development" == this.m_strSubSection )
        {   // for development, use the old synchronous script tag
            strTemplate = "<script type='text/javascript' language='JavaScript' src='{FILENAME}?{UPDATESTRING}' ></script>\n";
        } // end if
        else
        {   // for production, use the combined asynchronous script tag - does not block.
            strTemplate = "var objElement = document.createElement( 'script' ); objElement.src = '{FILENAME}?{UPDATESTRING}'; objElement.type = 'text/javascript';document.getElementsByTagName('head')[0].appendChild( objElement );\n";
        } // end if-else

        this.includeFile( strTemplate, in_strFilename );
    }

    protected void writeProductionScriptEnd()
    {
        if ("production" == this.m_strSubSection)
        {
            string strHeader = "</script>";
            Response.Write(strHeader);
        } // end if
    }

    protected void writeDevelopmentScriptEnd()
    {
        if ("development" == this.m_strSubSection)
        {
            string strHeader = "</script>";
            Response.Write(strHeader);
        } // end if
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


    protected void CreateFile()
    {
        string path = this.m_strVersion + ".js";

        if (!File.Exists(path))
        {
            // Create a file to write to.
            using (StreamWriter sw = File.CreateText(path))
            {
                sw.WriteLine("Hello");
                sw.WriteLine("And");
                sw.WriteLine("Welcome");
            }
        }

    }
     
	// Changed back to use ASP, because it is not dependent on all our other JS loading up (also sometimes seems faster)
    protected void Logout_Click(object sender, EventArgs e)
    {
        //redirect the user to their referring page
        Response.Redirect("../Pages/InstantRelay.aspx?cmd=LOGOUTUSER");
    }

    protected void includePremiumClass()
    {
        if (true == this.m_bPaidUser)
        {
            //Response.Write( "Premium" );
        } // end if
    }

    protected void PremiumAd()
    {
        string connectionString = ConfigurationManager.AppSettings["keyConn"];

        SqlConnection sqlConnection = new SqlConnection(connectionString);
        using (sqlConnection)
        {
            DatabaseHelper.OpenConnectionSafe(sqlConnection);
            User objUser = new Ubernote.Data.User(sqlConnection);

            UserInfo objUserInfo = new UserInfo(HttpContext.Current);
            string strSID = objUserInfo.GetPrimarySID();

            bool bDisplayAds = objUser.ServeAds(strSID);

            if (bDisplayAds)
            {
                Response.Write("<br><br><a href='../pages/supporterreg.aspx?source=internal' target = '_blank' class='about-link'><img src='../wwwImages/shared/premiumad.png'/></a>");
            }
        }        
    }
}
