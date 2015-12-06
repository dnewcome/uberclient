/**
* Factory - act as a factory to create things.  
*/
function Factory() {
};

TypeCheck.createForObject( 'Factory' );
Object.extend( Factory.prototype, {
    /**
    * create - create an instance and initialize it.  
    * @param {Object} in_objConfig - Configuration for constructor.  Contains two fields.
    *     {String} type - type to create.
    *     {Object} config (optional) - optional configuration to pass to init function, 
    *       if not given, pass entire in_objConfig.
    * @returns {Variant} - created item.
    */
    create: function( in_objConfig )
    {
        Util.Assert( TypeCheck.Object( in_objConfig ) );
        
        var strType = in_objConfig.type;

        Util.Assert( TypeCheck.String( strType ) );
        Util.Assert( TypeCheck.Function( window[ strType ] ), 'Object type "' + strType + '" does not exist' );
        
        var objRetVal = new window[ strType ]();
        
        if( objRetVal )
        {
            if( in_objConfig.Plugins )
            {
                this._addPlugins( objRetVal, in_objConfig );
            } // end if
            objRetVal = this._initObject( objRetVal, in_objConfig );
        } // end if
        
        return objRetVal;
    },
    
    _addPlugins: function( in_objObject, in_objConfig )
    {
        var afncPlugins = in_objConfig.Plugins || [];
        var objPlugin = undefined;
        for( var nIndex = 0, vPlugin; vPlugin = afncPlugins[ nIndex ]; ++nIndex )
        {
            if( TypeCheck.Function( vPlugin ) )
            {
                objPlugin = new vPlugin();
                objPlugin.init( { m_objPlugged: in_objObject } );
            } // end if
            else if ( TypeCheck.Object( vPlugin ) )
            {   // Just make it recursive.
                vPlugin.config = vPlugin.config || {};
                vPlugin.config.m_objPlugged = in_objObject;
                // XXX not sure if I like this change from this.create to this
                //  longer version.  Doesn't FEEL right.
                objPlugin = Factory.prototype.create.apply( this, [ vPlugin ] );
            } // end if-else if
        } // end for
        
        return in_objObject;
    },
    
    
    _initObject: function( in_objObject, in_objConfig )
    {
        if( in_objObject.init )
        {
            var objConfig = in_objConfig.config || in_objConfig;
            in_objObject.init( objConfig );
        } // end if
        
        return in_objObject;
    }
} );
