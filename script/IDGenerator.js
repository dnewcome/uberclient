
/**
* UniqueIDGenerator - A unique ID Generator.  
* Usage: var objIDGenerator = new UniqueIDGenerator( 'generator_name' );
*        var strUniqueID = objIDGenerator.getUniqueID();
*/

function UniqueIDGenerator( in_strGeneratorName )
{
    Util.Assert( TypeCheck.String( in_strGeneratorName ) );
    
    this.count = 0;
    this.m_strGeneratorName = in_strGeneratorName;
}

/**
* getUniqueID - get a uniqueID for this generator.
* @returns {String} - A unique id.
*/
UniqueIDGenerator.prototype.getUniqueID = function()
{
    this.count++;
    return ( this.m_strGeneratorName + this.count );
};



