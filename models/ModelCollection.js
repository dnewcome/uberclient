
/**
* ModelCollection - a collection of a type of models.  Has add/delete/loadAll/teardown functionality.
*/

function ModelCollection()
{
    this.length = undefined;
    this.m_strModelType = 'unknown';

    this.m_nFirstModelTimeout = 500;    
    this.m_nLastModelTimeout = 250;
    this.m_nMaxModelsToLoad = 50;
    
    ModelCollection.Base.constructor.apply( this, arguments );
};
UberObject.Base( ModelCollection, UberObject );

/**
* init - Initialize the collection
* @param {String} in_strModelType - model type to use for messages.
*/
ModelCollection.prototype.init = function( in_strModelType )
{
    Util.Assert( TypeCheck.String( in_strModelType ) );
    
    this.length = 0;
    this.m_strModelType = in_strModelType;
    
    ModelCollection.Base.init.apply( this );
};

ModelCollection.prototype.RegisterMessageHandlers = function()
{   
    var strType = this.m_strModelType;
    this.RegisterListener( 'request' + strType + 'add', Messages.all_publishers_id, this.add );
    this.RegisterListener( 'request' + strType + 'loadall', Messages.all_publishers_id, this.loadAll );
	this.RegisterListener( 'request' + strType + 'check', Messages.all_publishers_id, this.OnModelCheck );
	this.RegisterListener( 'request' + strType + 'load', Messages.all_publishers_id, this.OnModelLoad );
};

/**
* loadAll - load all from the DB and raise a load message.
*/
ModelCollection.prototype.loadAll = function()
{
    var bRetVal = this.dbLoadAll.apply( this, arguments );
    
    if( bRetVal )
    {
        this.Raise( this.m_strModelType + 'load' );
    } // end if
};

/**
* OnModelLoad - Forces an update on a model.
*   If needs loaded, or re-loaded, do it.
* @param {String} in_strModelID - ModelID to check.
* @param {Date} in_dtUpdate (optional) - Update date to check.
*/
ModelCollection.prototype.OnModelLoad = function( in_strModelID, in_dtUpdate )
{
    // Force the update
    this.loadModelBatch( in_strModelID, {} );
};

/**
* OnModelCheck - Forces an update on a model.
*   If needs loaded, or re-loaded, do it.
* @param {String} in_strModelID - ModelID to check.
* @param {Date} in_dtUpdate (optional) - Update date to check.
*/
ModelCollection.prototype.OnModelCheck = function( in_strModelID, in_dtUpdate )
{
    // Force the update
    this.loadModelBatch( in_strModelID, {} );
};

/**
* remove - Remove a model from our collection - Note the model object itself 
*   takes care of deleting itself from the database.
* @param {String} in_strModelID {String} - ID of the model to delete
* @returns {Object} Removed model if successful, undefined otw.
*/
ModelCollection.prototype.remove = function( in_strModelID )
{
    Util.Assert( TypeCheck.String( in_strModelID ) );
    
	var objRetVal = this.m_aobjChildren.removeByKey( in_strModelID );

	this.length = this.m_aobjChildren.length;
    this.UnRegisterListener( this.m_strModelType + 'delete', in_strModelID, this.remove );
    
    return objRetVal;
};

/**
* insert - insert a model into the collection
* @param {String} in_strModelID - ID to use for model
* @param {variant} in_objModel - model to store.
* @param {Number} in_nIndex (optional) - Index where to insert the object.  If not
*   given, adds to the end.
* @returns {Number} - index into the collection on success (i.e. does not 
*       already exist), -1 otw.
*/
ModelCollection.prototype.insert = function( in_strModelID, in_objModel, in_nIndex )
{
    Util.Assert( TypeCheck.String( in_strModelID ) );
    Util.Assert( TypeCheck.Model( in_objModel ) );
    Util.Assert( TypeCheck.UNumber( in_nIndex ) );
    
    var nRetVal = this.m_aobjChildren.add( in_strModelID, in_objModel, in_nIndex );
    if( nRetVal > -1 )
    {
        this.length = this.m_aobjChildren.length;
        
        // We only want to listen for the models that we have attached to us.
        this.RegisterListener( this.m_strModelType + 'delete', in_strModelID, this.remove );
    } // end if
    return nRetVal;
};

/**
* add - Add a model - add a model to our collection, and raise an 'add' message on success
*   OnDBAddComplete will ONLY be called if the derived dbAdd is Synchronous, if it is Async,
*   the dbAdd function is responsible for calling postDBAdd
* @param {variant} arguments - all the arguments that get passed to dbAdd.
* @returns {bool} true if successful, false otw.
*/
ModelCollection.prototype.add = function()
{
    var bRetVal = false;
    // Yes, yes, ask yourself why this works.  But we have to do it like this
    //  so we can pass all the arguments to the highest level dbAdd without it
    //  being in an array.
    var objModel = this.dbAdd.apply( this, arguments );
    
    // If we got a model back, it was synchronous, add to collection, raise messages.
    if( TypeCheck.Model( objModel ) )
    {   // try to insert it
        bRetVal = this.OnDBAddComplete( objModel );
    } // end if
    
    return bRetVal;
};

/**
* OnDBAddComplete - Inserts a newly created model and raise the 'modeltype'+add message with the model.
* @param {Object} in_objModel - Model to insert
* @param {String} in_strAltID (optional) - Alternate ID to raise 'add' message from.
* @returns {bool} true if succesfully inserted, false otw.
*/
ModelCollection.prototype.OnDBAddComplete = function( in_objModel, in_strAltID )
{
    Util.Assert( TypeCheck.Model( in_objModel ) );
    Util.Assert( TypeCheck.UString( in_strAltID ) );
    
    // This may call an overridden specialized insert.
    var nIndex = this.insert( in_objModel.m_strID, in_objModel );
    var bRetVal = ( -1 < nIndex );
    if ( bRetVal )
    {   // Pass the index into the collection along so it doesn't need recalculated 
        //  in any displays that display this collection verbatim.
        this.Raise( this.m_strModelType + 'add', [ in_objModel ], false, 
            in_strAltID || /*in_objModel.m_strID */ this.m_strMessagingID );
    } // end if
    
    return bRetVal;
};

/**
* getByID - get a model by ID.
* @param {String} in_strModelID - ModelID to get
* @returns {Object} Model if valid, undefined otw.
*/
ModelCollection.prototype.getByID = function( in_strModelID )
{
    Util.Assert( TypeCheck.String( in_strModelID ) );
    
    var objRetVal = this.m_aobjChildren.getByKey( in_strModelID );
    return objRetVal;
};

/**
* getByIndex - get a model by Index.
* @param {String} in_nIndex - index of model to get
* @returns {Object} Model if valid, undefined otw.
*/
ModelCollection.prototype.getByIndex = function( in_nIndex )
{
    Util.Assert( TypeCheck.Number( in_nIndex ) );
    
    var objRetVal = this.m_aobjChildren.getByIndex( in_nIndex );
    return objRetVal;
};

/**
* raiseLoad - raise a 'model_type'load message with the object
* @param {Object} in_objModel - model to raise the load message for
*/

ModelCollection.prototype.raiseLoad = function( in_objModel )
{
    Util.Assert( TypeCheck.Model( in_objModel ) );
    
    this.Raise( this.m_strModelType + 'load', [ in_objModel, in_objModel.m_strID ], false, in_objModel.m_strID );
};

/**
* dbLoadAll - Base function that must be overridden - meant to get all models
*   from the db for this collection.
* Overridden dbLoadAll must return boolean.
* @returns {bool} true indicating success, false otw.
*/
ModelCollection.prototype.dbLoadAll = function()
{
    Util.Assert( false, 'ModelCollection.prototype.dbLoadAll: ' + 'function must be overridden and not called.' );
};

/**
* dbAdd - Base function that must be overridden - meant to
*   add a model to the db and the collection.
* @returns {object} Object that is the newly added model.
*/
ModelCollection.prototype.dbAdd = function()
{
    Util.Assert( false, 'ModelCollection.prototype.dbAdd: ' + 'function must be overridden and not called.' );
};


/**
* loadModelBatch - add a model to a batch load list.
* @param {String} in_strModelID - ModelID to add.
* @param {Variant} in_vConfig (optional) - Configuration for model 
*   to pass to updateBatchItem or addBatchItem
*/
ModelCollection.prototype.loadModelBatch = function( in_strModelID, in_vConfig )
{
    Util.Assert( TypeCheck.String( in_strModelID ) );
    
    var objConfig, objBatch = this._getBatch();

    if( objConfig = objBatch.m_objList[ in_strModelID ] )
    {   // Already in the list, update the force flag/error level
        this.updateBatchItem( objBatch, in_strModelID, objConfig, in_vConfig );
    } // end if
    else
    {   // Not in the list, make a new one
        this.addBatchItem( objBatch, in_strModelID, in_vConfig );
    } // end if
    
    // if max reached, go load the notes as soon as we can.
    var nTimeout = ( this.m_nMaxModelsToLoad == objBatch.m_nCount ) ? 0 : this.m_nLastModelTimeout;
    if( objBatch.m_objLastReqTimeoutID )
    {   // clear any old timeouts.
        Timeout.clearTimeout( objBatch.m_objLastReqTimeoutID );
    } // end if
    objBatch.m_objLastReqTimeoutID = Timeout.setTimeout( this._processBatch, 
        nTimeout, this, [ objBatch ] );
};

/**
* _getBatch - get the current batch items should be added to.
* @returns {Object} - batch new items should be added to.
*/
ModelCollection.prototype._getBatch = function()
{   
    if( ( ! this.m_objCurrentBatch ) || ( this.m_objCurrentBatch.m_bProcessing ) )
    {   // Create new batch item if the old one is being processed or we don't have one.
        this.m_objCurrentBatch = objRetVal = { m_objList: {}, m_nCount: 0 };
    } // end if
    
    var objRetVal = this.m_objCurrentBatch;
    return objRetVal;
};

/**
* addBatchItem - create a new batch item and update the batch
* @param {Object} in_objBatch - Batch to add item to.
* @param {String} in_strModelID - NoteID to add.
* @param {Variant} in_vConfig (optional) - Configuration for item.
* @param {bool} in_bForce - whether to force load from DB.
*/
ModelCollection.prototype.addBatchItem = function( in_objBatch, in_strModelID, in_vConfig )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );
    Util.Assert( TypeCheck.String( in_strModelID ) );
     
    var objItem = this.createBatchItem( in_vConfig );
    in_objBatch.m_objList[ in_strModelID ] = objItem;
    
    if( 0 == in_objBatch.m_nCount )
    {   // first note, start first note timer.
        in_objBatch.m_objFirstReqTimeoutID = Timeout.setTimeout( this._processBatch, 
            this.m_nFirstModelTimeout, this, [ in_objBatch ] );
    } // end if
    
    in_objBatch.m_nCount++;
};

/**
* createBatchItem - create and return a new batch item. Override this if
*   special batch item needed. 
* @param {Variant} in_vConfig - Configuration with which to create a batch item.
* @returns {Object} new batch item
*/
ModelCollection.prototype.createBatchItem = function( in_vConfig )
{
    var objRetVal = in_vConfig;
    return objRetVal;
};

/**
* getBatchItem - update an item in the batch list with the load level and force flag
* @param {String} in_strModelID - ModelID to add.
* @returns {Object} 
*/
ModelCollection.prototype.getBatchItem = function( in_strModelID )
{
    Util.Assert( TypeCheck.String( in_strModelID ) );
    
    var objRetVal = in_objBatch.m_objList[ in_strModelID ];
    return objRetVal;
};

/**
* updateBatchItem - update an item in the batch list.  
*   Default behavior is to replace old batch item with new.
*   Should be overriden if we want specialized processing.
* @param {Object} in_objBatch - Batch to add item to.
* @param {String} in_strModelID - NoteID to add.
* @param {Variant} in_vOldConfig (optional) - Old configuration for item.
* @param {Variant} in_vNewConfig (optional) - Updating configuration for item.
*/
ModelCollection.prototype.updateBatchItem = function( in_objBatch, in_strModelID, 
    in_vOldConfig, in_vNewConfig )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );
    Util.Assert( TypeCheck.String( in_strModelID ) );
    
    var objItem = this.createBatchItem( in_vNewConfig );
    in_objBatch.m_objList[ in_strModelID ] = objItem;
};

/**
* removeBatchItem - remove an item in the batch list.
* @param {String} in_strModelID - ModelID to remove.
* @returns {Object} deleted configuration object if successful, undefined otw.
*/
ModelCollection.prototype.removeBatchItem = function( in_strModelID )
{
    Util.Assert( TypeCheck.String( in_strModelID ) );

    var objRetVal = in_objBatch.m_objList[ in_strModelID ];
    if( objRetVal )
    {
        in_objBatch.m_objList[ in_strModelID ] = undefined;
        delete in_objBatch.m_objList[ in_strModelID ];
        in_objBatch.m_nCount--;
    } // end if
    
    return objRetVal;
};

/**
* checkLoad - check whether to load a model or not.
* @param {object} objModel - Model for this item.
* @param {Variant} in_vConfig - Config for this item.
*/
ModelCollection.prototype.checkLoad = function( in_objModel, in_vConfig )
{
    return true;
};

/**
* _processBatch - Attempt to process a batch of requests.
*   See if each note in the list is requesting a higher level of loading
*   than is already done, or whether it was forced.
* @param {Object} in_objBatch - the notes to load with configuration.
*   each item is of the form: 
*/
ModelCollection.prototype._processBatch = function( in_objBatch )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );

    if( ! in_objBatch.m_bProcessing )
    {   // not already processing, so lets do it!
        this.dbProcessBatchPre( in_objBatch );
        this._processBatchItems( in_objBatch );
        this.dbProcessBatchPost( in_objBatch );
    } // end if
};

/**
* _processBatchItems - process each batch item.
* @param (Object) in_objBatch - the batch.
*/
ModelCollection.prototype._processBatchItems = function( in_objBatch )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );

    for( var strModelID in in_objBatch.m_objList )
    {
        var vConfig = in_objBatch.m_objList[ strModelID ];
        var objModel = this.m_aobjChildren.getByKey( strModelID );
        if( !objModel || this.checkLoad( objModel, vConfig ) )
        {   // either don't have it or have to update it
            objModel = this.dbProcessBatchItem( in_objBatch, strModelID, vConfig );
        } // end if
        else
        {   // decrease the count so we only call the DB if we really need to.
            in_objBatch.m_nCount--;
        } // end if-else
        
        if( objModel )
        {
            this.raiseLoad( objModel );
        } // end if
    } // end for
};

/**
* dbProcessBatchPre  - Called before batch items are processed.
* @param {Object} in_objBatch - an object with a list of note IDs.
*/
ModelCollection.prototype.dbProcessBatchPre  = function( in_objBatch )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );

    // let us know we are processing this batch now.
    in_objBatch.m_bProcessing = true;

    Timeout.clearTimeout( in_objBatch.m_objFirstReqTimeoutID );
    Timeout.clearTimeout( in_objBatch.m_objLastReqTimeoutID );

    in_objBatch.all_model_ids = '';
};

/**
* dbProcessBatchPost - Called after batch items are processed.  Override
*   for specialty processing.  Could be used to call the DB.
* @param {Object} in_objBatch - an object with a list of note IDs.
* @returns {bool} true if DB request successfully made, false otw.
*/
ModelCollection.prototype.dbProcessBatchPost = function( in_objBatch )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );
};

/**
* dbProcessBatchItem - Called for each batch item.  Override
*   for specialty processing.  
* @param {Object} in_objBatch - batch to load item for.
* @param {String} in_strModelID - ID of model
* @param {Object} in_objItem (optional) - Configuration item for ID.
* @returns {Object} - If returns a model, a 'model_type'load message will
*   be raised with that model.  Returning undefined will cause no message
*   to be raised.
*/
ModelCollection.prototype.dbProcessBatchItem = function( in_objBatch, in_strModelID, in_objItem )
{
    Util.Assert( TypeCheck.Object( in_objBatch ) );
    Util.Assert( TypeCheck.String( in_strModelID ) );

    in_objBatch.all_model_ids += in_strModelID;

    return undefined;
};

/**
* loadDecodedItems - take the decoded item response from the DB and load them up.
*   Creates models if needed, updates models if needed.
* @param {Array} in_avDecodedItems - decoded items, let 
* @param {Bool} in_bRaiseLoad (optional) - Sets whether to raise the load message.  
*    Assumes true.
*/
ModelCollection.prototype.loadDecodedItems = function( in_avDecodedItems, in_bRaiseLoad )
{
    Util.Assert( TypeCheck.Array( in_avDecodedItems ) );
    Util.Assert( TypeCheck.UBoolean( in_bRaiseLoad ) );

    for( var nIndex = 0, objCurrItem; objCurrItem = in_avDecodedItems[ nIndex ]; ++nIndex )
    {   
        this._processItem( objCurrItem, in_bRaiseLoad );
    } // end for
};

/**
* _preProcessItem - used in conjunction with loadDecodedItems to pre-process
*   a decoded DB item and prepare it for loading/modifying a model.  An overridden
*   MUST SET A ID FIELD IN THE ITEM!
* @param {variant} in_objItem - item to pre process
* @returns {bool} true to start processing, false to abort.  Base item returns true.
*/
ModelCollection.prototype._preProcessItem = function( in_objItem )
{
    return true;
};

ModelCollection.prototype._processItem = function( in_objItem, in_bRaiseLoad )
{
    if( true === this._preProcessItem( in_objItem ) )
    {
        Util.Assert( in_objItem.ID, 'Missing ID field in _processItem' );
        var objModel = this.m_aobjChildren.getByKey( in_objItem.ID );
        if( ! objModel )
        {
            objModel = this._createModelFromItem( in_objItem );
            this.OnDBAddComplete( objModel );
            in_objItem.newitem = true;
        } // end if
        else
        {
            this._updateModelFromItem( objModel, in_objItem );
        } // end if-else
        
        this._postProcessItem( in_objItem, objModel, in_bRaiseLoad );
    } // end if
};

/**
* _postProcessItem - used in conjunction with loadDecodedItems to post-process
*   a decoded DB item. raises the model+load message.
* @param {variant} in_objItem - item to post process
* @param {Object} in_objModel - Model to post process.
* @param {bool} in_bRaiseLoad (optional) - Whether to raise the model+load message.
*   Assumed to be true.
*/
ModelCollection.prototype._postProcessItem = function( in_objItem, in_objModel, in_bRaiseLoad )
{
    Util.Assert( TypeCheck.Model( in_objModel ) );
    Util.Assert( TypeCheck.UBoolean( in_bRaiseLoad ) );
    
    in_objModel.m_objExtraInfo = in_objModel.m_objExtraInfo 
        || ( in_objModel.getExtraInfoObject && in_objModel.getExtraInfoObject() )
        || ( Object.clone( in_objItem ) );

    Object.updateIfAvailable( in_objModel.m_objExtraInfo, in_objItem );

    if( false !== in_bRaiseLoad )
    {
        this.raiseLoad( in_objModel );
    } // end if
};

/**
* _createModelFromItem - used in conjunction with loadDecodedItems to create
*   a new model from a decoded DB item.
* @param {Object} in_objModel - created Model 
* @param {variant} in_objItem - item to post process
*/
ModelCollection.prototype._createModelFromItem = function( in_objModel, in_objItem )
{
};

/**
* _updateModelFromItem - used in conjunction with loadDecodedItems to update
*   a model that exists with a decoded DB item.
* @param {Object} in_objModel - Model to update
* @param {variant} in_objItem - item to post process
*/
ModelCollection.prototype._updateModelFromItem = function( in_objModel, in_objItem )
{};
