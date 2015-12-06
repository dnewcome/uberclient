using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using Ubernote.Data;
using System.Data.SqlClient;
using Ubernote.Auth;

public partial class attachment : System.Web.UI.Page
{
    private string m_strNoteID = "";
    private string m_strSID = "";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (Page.IsPostBack != true)
        {
            string connectionString = ConfigurationManager.AppSettings["keyConn"];

            SqlConnection sqlConnection = new SqlConnection(connectionString);
            using (sqlConnection)
            {
                DatabaseHelper.OpenConnectionSafe(sqlConnection);

                UserInfo objUserInfo = new UserInfo(HttpContext.Current);
                Ubernote.Data.User objUserName = new Ubernote.Data.User(sqlConnection);

                if (objUserInfo.Valid())
                {
                    // get query strings
                    if (null != Request.QueryString["noteid"])
                    {
                        this.m_strNoteID = Request.QueryString["noteid"].ToString();
                    } // end if

                    this.m_strSID = objUserInfo.GetSession(true);
                } // end if
            } // end using
        } // end if
    } // end Page_Load

    protected void getSID()
    {
        Response.Write(this.m_strSID);
    } // end getSID

    protected void getNoteID()
    {
        Response.Write( this.m_strNoteID );
    } // end getNoteID
}
