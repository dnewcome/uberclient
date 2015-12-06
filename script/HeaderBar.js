
HeaderBar = (function() {
	/**
	* HeaderBar takes care of setting up the header bar on top.
	*/
	var HeaderBar = function() {
		HeaderBar.Base.constructor.apply( this, arguments );
	};
	UberObject.Base( HeaderBar, UberObject );

	Object.extend( HeaderBar.prototype, {
		init: function()
		{
			$( 'elementDashboard' ).update( _localStrings.DASHBOARD );
			$( 'elementFeedback' ).update( _localStrings.SEND_FEEDBACK );
			$( 'elementSettings' ).update( _localStrings.SETTINGS );
			$( 'elementLogout' ).update( _localStrings.LOGOUT );
			$( 'elementHi' ).update( _localStrings.HI );
			$( 'elementUsername' ).update( Ubernote.m_strUserName );
			
			HeaderBar.Base.init.apply( this, arguments );
		},
		
		RegisterMessageHandlers: function()
		{
			var me = this, register = me.RegisterListener.bind( me, 'onclick' );
			register( $( 'elementDashboard' ), showExternal.curry( 'externalPage', '../clientpages/dashboard.aspx' ) );
			register( $( 'elementSettings' ), showExternal.curry( 'externalPage', '../clientpages/settings.aspx' ) );
			register( $( 'elementLogout' ), OnLogout );
			register( $( 'elementFeedback' ), stopPropagation );
			register( $( 'elementTagsEdit' ), showExternal.curry( 'externalPage', '../clientpages/managetags.aspx' ) );
			register( $( 'elementFoldersEdit' ), showExternal.curry( 'externalPage', '../clientpages/managefolders.aspx' ) );
			register( $( 'elementContactsEditFrom' ), showExternal.curry( 'externalPage', '../clientpages/managecontacts.aspx' ) );
			register( $('elementContactsEditTo'), showExternal.curry( 'externalPage', '../clientpages/managecontacts.aspx' ) );
			register($('elementNewNote'), showExternal.curry('lightbox', '../clientpages/addnote.aspx'));
			register($('elementSearchTags'), showExternal.curry('lightbox', '../clientpages/searchtags.aspx'));
			register($('elementSearchShare'), showExternal.curry('lightbox', '../clientpages/sharesearch.aspx'));
			
			
			HeaderBar.Base.RegisterMessageHandlers.apply( me, arguments );
		},

		/**
		* showDashboard - shows the dashboard
		* @param {Object} in_objEvent - the event object.
		*/
		showDashboard: function( in_objEvent )
		{
			showExternal.call( this, 'externalPage', '../clientpages/dashboard.aspx', in_objEvent );
		}
	} );
	
	function stopPropagation( in_objEvent ) {
		in_objEvent.stopPropagation();
	}
	
	/**
	* OnLogout - Do the logout.
	* @param {Object} in_objEvent - the event object.
	*/
	function OnLogout( in_objEvent ) {
		Util.logout();
	}
	
	function showExternal( where, in_strURL, in_objEvent ) {
		Util.Assert( TypeCheck.String( in_strURL ) );
		Util.Assert( TypeCheck.UObject( in_objEvent ) );
		
		this.RaiseForAddress( 'show', where, [ in_strURL ] );
		if( in_objEvent )
		{
			in_objEvent.cancelEvent();
		} // end if
	}

	return HeaderBar;
}() );