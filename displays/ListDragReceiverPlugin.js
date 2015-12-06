function ListDragReceiverPlugin()
{
    return ListDragReceiverPlugin.Base.constructor.apply( this, arguments );
};
UberObject.Base( ListDragReceiverPlugin, Plugin );

Object.extend(ListDragReceiverPlugin.prototype, {
    loadConfigParams: function () {
        var objConfigParams = {
            m_objDragService: { type: 'object', bRequired: true },
            m_strMessage: { type: 'string', bRequired: true },
            type: { type: 'string', bRequired: false, default_value: 'ListDragReceiverPlugin' }
        };
        ListDragReceiverPlugin.Base.loadConfigParams.apply(this);
        Object.extend(this.m_objConfigParams, objConfigParams);
    },

    RegisterMessageHandlers: function () {
        this.RegisterListenerObject({ message: 'registerdroptarget',
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnRegisterDropTarget, context: this
        });
        this.RegisterListenerObject({ message: 'unregisterdroptarget',
            from: Messages.all_publishers_id,
            to: this.getPlugged().m_strMessagingID,
            listener: this.OnUnRegisterDropTarget, context: this
        });
        ListDragReceiverPlugin.Base.RegisterMessageHandlers.apply(this, arguments);
    },

    /**
    * OnRegisterDropTarget - register our drop handler when we mouse over 
    * @param {Object} in_objEvent - event that triggered this.
    */
    OnRegisterDropTarget: function (in_strItemID, in_objEvent, in_objItem) {
        Util.Assert(TypeCheck.Object(in_objEvent));

        var objDrug = this.m_objDragService.queryDragSource();

        if (objDrug) {
            this.m_strItemID = in_strItemID;
            this.m_objDragService.regDropTarget(this.OnDrop, this);
        } // end if
    },

    /**
    * OnUnRegisterDropTarget - When going out, cancel the drag.
    * @param {Object} in_objEvent - event that triggered this.
    */
    OnUnRegisterDropTarget: function (in_strItemID, in_objEvent, in_objItem) {
        Util.Assert(TypeCheck.Object(in_objEvent));

        if ((this.m_objDragService.dragging)
         && (DOMEvent.checkMouseLeave(in_objEvent))
         && (in_objEvent.relatedTarget != this.m_objDragService.m_objDragElement)) {
            this.m_objDragService.unregDropTarget();
        } // end if
    },

    /**
    * OnDrop - handler for objects dropped on a note object.
    * @in_objObject {object} this is the object that is being dropped on us.  
    *   For now we only get a ViewNodeDisplay
    */
    OnDrop: function (in_objObject) {
        if (in_objObject) {
            var objPlugged = this.getPlugged();
            var strMetaTagID = in_objObject.getMetaTagID();
            if (in_objObject.type == "tagged") {
                this.RaiseForAddress(this.m_strMessage, this.m_strItemID, [strMetaTagID]);
            }
            else {
                this.RaiseForAddress("requestnotefolderedadd", this.m_strItemID, [strMetaTagID]);
            }
        } // end if
    }
});    
