using System.IO;
using System;


/// <summary>
/// Summary description for ErrHandler
/// </summary>
public class ErrHandler
{
    public ErrHandler()
    {
    }

    /// Handles error by accepting the error message
    /// Displays the page on which the error occured
    public static void WriteError(string strErrorMessage)
    {
        try
        {
            // directory to save to
            string strDirectoryName = "C:\\errors\\";

            // create directory if it does not exist
            if (!Directory.Exists(strDirectoryName))
            {
                Directory.CreateDirectory(strDirectoryName);
            }

            string path = strDirectoryName + DateTime.Today.ToString("yy-MM-dd") + ".txt";
            if (!File.Exists(path))
            {
                File.Create(path).Close();
            }
            using (StreamWriter w = File.AppendText(path))
            {
                w.WriteLine("\r\nLog Entry : ");
                w.WriteLine("{0}", DateTime.Now.ToString());
                string err = "Error in: " + System.Web.HttpContext.Current.Request.Url.ToString() +
                              ". Error Message:" + strErrorMessage;
                w.WriteLine(err);
                w.WriteLine("__________________________");
                w.Flush();
                w.Close();
            }
        }
        catch { }
    }
}
