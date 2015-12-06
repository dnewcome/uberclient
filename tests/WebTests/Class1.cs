using System;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using NUnit.Framework;
using Selenium;

namespace Ubernote.Tests.SeleniumTests
{
	[TestFixture]
	public class ApplicationFixture
	{
		private ISelenium selenium;
		private StringBuilder verificationErrors;

		[SetUp]
		public void SetupTest()
		{
			selenium = new DefaultSelenium( "localhost", 4444, "*firefox", "http://localhost" );
			selenium.Start();
			verificationErrors = new StringBuilder();
		}

		[TearDown]
		public void TeardownTest()
		{
			try
			{
				selenium.Stop();
			}
			catch( Exception )
			{
				// Ignore errors if unable to close the browser
			}
			Assert.AreEqual( "", verificationErrors.ToString() );
		}

		/**
		* Test simply logging into the app
		*/
		[Test]
		public void LoginTest()
		{
			selenium.Open( "/ubernote/pages/default.aspx" );
			selenium.Click( "Login" );
			selenium.WaitForPageToLoad( "30000" );
			selenium.Type( "ctl00_ContentPlaceHolder2_txtUsername", "dan" );
			selenium.Type( "ctl00_ContentPlaceHolder2_txtPassword", "dan" );
			selenium.Click( "ctl00_ContentPlaceHolder2_btnLogin" );
			selenium.WaitForPageToLoad( "30000" );
			Assert.AreEqual( "Online Web Notes - UberNote", selenium.GetTitle() );
		}
	}
}
