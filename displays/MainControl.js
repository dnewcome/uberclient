MainControl = (function () {
    "use strict";
    /**
    * Main left side selector control
    */
    var MainControl = function () {
        MainControl.Base.constructor.call(this);
    };
    UberObject.Base(MainControl, DisplayAltConfig);
    Object.extend(MainControl.prototype, {
        /**
        * markSelected - mark us as selected and start listening for when we lose our highlight.
        * @param {Object} in_objElement - HTMLElement to mark as selected
        * @returns {bool} true if in_objElement element exists, false otherwise.
        */
        markSelected: function (in_objElement) {
            Util.Assert(in_objElement);
            var bRetVal = false, me = this;

            me.RegisterListener('requestnoteids', Messages.all_publishers_id, me.OnRequestNoteIDs);
            me.RegisterListener('requestdisplaynoteset', Messages.all_publishers_id, me.unmarkSelected);

            me.m_objElementCurrentSelected = in_objElement;
            bRetVal = me._HTMLMarkSelected(in_objElement);

            return bRetVal;
        },

        /**
        * OnRequestNoteIDs - When a request comes in to display a set of notes,
        *   we have to check to see if we unselect the current category.
        * @param {Object} in_objConfig - Configuration request object.
        */
        OnRequestNoteIDs: function (in_objConfig) {
            Util.Assert(TypeCheck.Object(in_objConfig));
            Util.Assert(TypeCheck.UString(in_objConfig.metatagid));
            Util.Assert(TypeCheck.UString(in_objConfig.collectionid));

            var me = this;
            if (me.m_strCurrMetaTagID && me.m_strCurrCollectionID
			 && ((in_objConfig.metatagid != me.m_strCurrMetaTagID)
			   || (in_objConfig.collectionid != me.m_strCurrCollectionID))) {
                me.unmarkSelected();
            }

            me.m_strCurrMetaTagID = in_objConfig.metatagid;
            me.m_strCurrCollectionID = in_objConfig.collectionid;
        },

        /**
        * unmarkSelected - unmark us as selected and stop listening for when we lose our highlight.
        * @returns {bool} true if "selected" element exists, false otherwise.
        */
        unmarkSelected: function () {
            var bRetVal = false, objElement = this.m_objElementCurrentSelected, me = this;
            delete me.m_objElementCurrentSelected;

            me.UnRegisterListener('requestnoteids', Messages.all_publishers_id, me.OnRequestNoteIDs);
            me.UnRegisterListener('requestdisplaynoteset', Messages.all_publishers_id, me.unmarkSelected);

            bRetVal = me._HTMLUnmarkSelected(objElement);

            return bRetVal;
        },



        /**
        * doButtonAction - Generalized function that takes care of processing the buttons.
        * @param {String} in_strButton - DOM Selector for the button to highlight.
        * @param {Variant} in_vAction - Either a function callback or message to raise 
        *               on button selection
        * @param {Variant} in_vScope - Depends on in_vAction - if in_vAction is a function,
        *       this must be an object that defines the scope in which to call the callback.
        *       if in_vAction is a string(ie message), this is optional.  If undefined, message
        *       is broadcast, if defined, this is the address to send message to.
        * @param {Array} in_aobjArguments - Arguments with which to call function or send 
        *       with message.
        * @returns {bool} true if element selected by in_strButton exists, false otherwise.
        */
        doButtonAction: function (in_strButton,
			in_vAction, in_vScope, in_aobjArguments) {
            Util.Assert(TypeCheck.String(in_strButton));
            Util.Assert(TypeCheck.UFunction(in_vAction) || TypeCheck.String(in_vAction));

            if (in_vAction) {
                if (TypeCheck.Function(in_vAction)) {
                    Util.Assert(TypeCheck.Object(in_vScope));
                    in_vAction.apply(in_vScope, in_aobjArguments);
                }
                else if (TypeCheck.String(in_vAction)) {
                    if (in_vScope) {   // Send to a particular address
                        this.RaiseForAddress(in_vAction, in_vScope, in_aobjArguments);
                    }
                    else {   // Send to the world
                        this.Raise(in_vAction, in_aobjArguments);
                    }
                }
            }

            this.unmarkSelected();
            if (in_aobjArguments && in_aobjArguments[0]) {
                this.m_strCurrMetaTagID = in_aobjArguments[0].metatagid;
                this.m_strCurrCollectionID = in_aobjArguments[0].collectionid;
            }

            // Have to do this in a setTimeout or else the above raise will unselect the button
            //  we just selected.
            var bRetVal = Timeout.setTimeout(function () { this._selectButton(in_strButton); }, 0, this);

            this.RaiseForAddress('hide', 'externalpage');

            return bRetVal;
        },

        /**
        * selectSearch - Request Search.  
        * @param {String} in_strSearchTerm (optional) - Search term.
        */
        selectSearch: function (in_strSearchTerm) {
            if (!TypeCheck.UString(in_strSearchTerm)) {
                in_strSearchTerm = '';
            }

            var bRetVal = false;

            if (in_strSearchTerm) {   // Only do this if we actually have a search term
                var strURL = '../clientpages/search.aspx?searchTerm=' + encodeURIComponent(in_strSearchTerm);
                showExternalPage.call(this, strURL);

                //this.logFeature( 'Search Notes', '' );
            }
            else {
                var strURL = '../clientpages/search.aspx?searchTerm=';
                showExternalPage.call(this, strURL);
                //this.Raise( 'appokmessage', [ _localStrings.EMPTY_SEARCH_TERM_ERROR, 'error' ] );
            }

            return bRetVal;
        },

        /**
        * RegisterDomEventHandlers - Get the DOM elements.  If an element does not exist in the template,
        *   the event handlers for that DOM element will not be called.
        */
        RegisterDomEventHandlers: function () {
            var me = this;
            MainControl.Base.RegisterDomEventHandlers.call(me);

            //			me.attachButton( 'MainControlAllNotes', me.selectAllNotes );
            me.attachButton('MainControlUnfolderedNotes', me.selectUnfolderedNotes);
            me.attachButton('MainControlStarred', me.selectStarred);

            /*me.attachButton( 'MainControlTagged', me.selectTagged );
            me.attachButton( 'MainControlShared', me.selectShared );
            */
        },

        /**
        * getCategoryCounts
        */
        getCategoryCounts: function () {
            //this.getAllNotesCount();
            this.getUnfolderedNotesCount();
            this.getStarredCount();
        },
        /*
        getAllNotesCount: function() {
        this._updateCategoryNoteCount( 'elementAllNotesCount', SystemCategories.Categories.all );
        },
        */
        getUnfolderedNotesCount: function () {
            this._updateCategoryNoteCount('elementUnfolderedNotesCount', SystemCategories.Categories.nofolder);
        },

        getStarredCount: function () {
            this._updateCategoryNoteCount('elementStarredCount', SystemCategories.Categories.starred);
        },

        OnActivityUpdateNoteAdd: function () {
            // Highlight the count in the main count.
            this.$('MainControlUnfolderedNotes').addClassName('bold');
        },

        /**
        *   Message and event handling section
        */


        /**
        * RegisterMessageHandlers - Registers the message handlers
        */
        RegisterMessageHandlers: function () {
            var me = this, register = me.RegisterListener.bind(me);
            //register( 'systemcategoriesupdate', SystemCategories.Categories.all, me.getAllNotesCount );
            register('systemcategoriesupdate', SystemCategories.Categories.nofolder, me.getUnfolderedNotesCount);
            register('systemcategoriesupdate', SystemCategories.Categories.starred, me.getStarredCount);

            //register( 'categoryselectall', Messages.all_publishers_id, me.selectAllNotes );
            register('categorysetall', Messages.all_publishers_id, me.setUnfolderedNotes);
            register('categoryselectsearch', Messages.all_publishers_id, me.selectSearch);

            register('activityupdatenoteadd', Messages.all_publishers_id, me.OnActivityUpdateNoteAdd);

            MainControl.Base.RegisterMessageHandlers.call(me);
        },

        /**
        * _HTMLMarkSelected - mark us as selected on the display.
        *   this is an internal helper function.
        * @param {Object} in_objElement (optional) - Element to mark selected
        * @returns {bool} true if there is a DOM container, false otw.
        */
        _HTMLMarkSelected: function (in_objElement) {
            var bRetVal = false;
            if (in_objElement) {
                in_objElement.addClassName('selected');
                bRetVal = true;
            }
            return bRetVal;
        },

        /**
        * _HTMLUnmarkSelected - remove our selection mark from the display
        *   this is an internal helper function.
        * @param {Object} in_objElement (optional) - Element to mark selected
        * @returns {bool} true if there is a DOM container, false otw.
        */
        _HTMLUnmarkSelected: function (in_objElement) {
            var bRetVal = false;
            if (in_objElement) {
                in_objElement.removeClassName('selected');
                bRetVal = true;
            }
            return bRetVal;
        },


        /**
        * _updateCategoryNoteCount - update the note count for a category, place count 
        *   in the element selector defined by in_strElementSelector.  Call an optional
        *   callback with the count.
        * @param {String} in_strElementSelector - element selector in which to place the count.
        * @param {String} in_strCategoryID - category ID to get the count for.
        * @param {Function} in_fncCallback (optional) - callback to call with the count.
        */
        _updateCategoryNoteCount: function (in_strElementSelector,
			in_strCategoryID, in_fncCallback) {
            Util.Assert(TypeCheck.String(in_strElementSelector));
            Util.Assert(TypeCheck.String(in_strCategoryID));
            Util.Assert(TypeCheck.UFunction(in_fncCallback));

            var nCount = this._getCategoryNoteCount(in_strCategoryID);
            this._HTMLSetCategoryCount(in_strElementSelector, nCount);

            if (in_fncCallback) {
                in_fncCallback(nCount);
            }
        },

        /**
        * _getCategoryCount - get the note count for a category
        * @param {String} in_strCategoryID - Category ID of category to get count for
        * @returns {Number} - Number of notes for the category/count type.
        */
        _getCategoryNoteCount: function (in_strCategoryID) {
            Util.Assert(TypeCheck.String(in_strCategoryID));

            var nRetVal = 0;
            var objCategory = app.systemcategories.getByID(in_strCategoryID);

            if (objCategory) {
                nRetVal = objCategory.m_objExtraInfo.Note_Count;
            }

            return nRetVal;
        },
        /**
        * _HTMLSetCategoryCount - the purpose is to check to see if there is a 
        *   count element, then get its count from the categories, and set the 
        *   appropriate element.
        * @param {String} in_strElementSelector - element selector
        * @param {Number} in_nCount - Count to display.
        */
        _HTMLSetCategoryCount: function (in_strElementSelector,
			in_nCount) {
            Util.Assert(TypeCheck.String(in_strElementSelector));
            Util.Assert(TypeCheck.Number(in_nCount));

            this.setChildHTML(in_strElementSelector, '(' + in_nCount.toString() + ')');
            if (in_strElementSelector == 'elementUnfolderedNotesCount') {

                if (in_nCount == 0) {
                    this.setChildHTML(in_strElementSelector, '<img src=\'images/inboxclean.png\' style="v-align:center;">');
                }
                else {
                    this.setChildHTML(in_strElementSelector, '(' + in_nCount.toString() + ') ' + '<img alt=\'Clean it\' src=\'images/inboxerror.png\' style="height:16px; width:16px">');
                }

            }
        },

        /**
        * _selectButton - select a button and mark it as loading
        * @param {String} in_strButton - Button name to select
        * @returns {Bool} true if button found, false otw.
        */
        _selectButton: function (in_strButton) {
            var objButtonElement = this.$(in_strButton);
            var bRetVal = this.markSelected(objButtonElement);

            return bRetVal;
        },

        /**
        * setUnfolderedNotes - reset us to "all notes" clearing any other selections
        *   that there are.
        */
        setUnfolderedNotes: function () {
            var me = this;

            me.unmarkSelected();
            me.$('MainControlUnfolderedNotes').removeClassName('bold');

            me.m_strCurrMetaTagID = SystemCategories.Categories.nofolder;
            me.m_strCurrCollectionID = MetaTags.eCollections.systemcategories;

            me._selectButton('MainControlUnfolderedNotes');
        } /*,
		
		selectTagged: function( event ) {
			event.cancelEvent();
			showExternalPage.call( this, '../clientpages/managetags.aspx' );
		},

		selectShared: function( event ) {
			event.cancelEvent();
			showExternalPage.call( this, '../clientpages/manageshares.aspx' );
		}
		*/
    });

    function showExternalPage(page) {
        this.RaiseForAddress('show', 'externalpage', [page]);
    }

    var aobjFunctions = [
    /*{ func: 'selectAllNotes', button: 'MainControlAllNotes', 
    log: 'Select All Notes', category: SystemCategories.Categories.all, 
    collectionid: MetaTags.eCollections.systemcategories },*/
		{func: 'selectUnfolderedNotes', button: 'MainControlUnfolderedNotes',
		log: 'Select Unfoldered Notes', category: SystemCategories.Categories.nofolder,
		collectionid: MetaTags.eCollections.systemcategories
},
		{ func: 'selectStarred', button: 'MainControlStarred',
		    log: 'Select Starred Notes', collectionid: MetaTags.eCollections.systemcategories,
		    category: SystemCategories.Categories.starred
		}

	];

    var createFunction = function (in_objEntry) { // do this to create the function.
        MainControl.prototype[in_objEntry.func] = function () {
            if (in_objEntry.log) { this.logFeature(in_objEntry.log, ''); }

            if ('selectUnfolderedNotes' == in_objEntry.func) {   // remove the bold from the count.
                this.$('MainControlUnfolderedNotes').removeClassName('bold');
            }

            var bRetVal = this.doButtonAction(in_objEntry.button,
				'requestdisplaynotes', undefined, [{
				    collectionid: in_objEntry.collectionid,
				    metatagid: in_objEntry.category,
				    page: 0
				}]);

            return bRetVal;
        }; // end function
    };

    UberObject.createTemplateFunctions(createFunction, aobjFunctions);



    return MainControl;
} ());