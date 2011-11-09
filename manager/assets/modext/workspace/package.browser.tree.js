/**
 * The tree panel holding the repository categories
 * 
 * @class MODx.tree.PackageBrowserTree
 * @extends MODx.tree.Tree
 * @param {Object} config An object of options.
 * @xtype modx-package-browser-tree
 */
MODx.tree.PackageBrowserTree = function(config) {
    config = config || {};
    Ext.applyIf(config,{
		url: MODx.config.connectors_url+'workspace/packages-rest.php'
		,baseParams: {
			action: 'getNodes'
			,provider: MODx.provider
		}	
		,loaderConfig: {
            preloadChildren: false
        }
		,stateful: false
		,rootVisible: false
		,enableDD: false
		,autoHeight: true
		,singleExpand: true
		,root:{
			text: _('provider')
			,nodeType: 'async'
			,id: 'modx-package-browser-tree-root'
		}
		,tbar: [{
			xtype: 'textfield'
			,emptyText: _('search')
			,name: 'search'
			,id: 'package-browser-search-fld'
			,cls: 'icon-search'
			,hideMode: 'offsets'
			,width: 250
			,listeners: {
				change: this.search
				,specialkey: function( form, e ) {
					if(e.getKey() == Ext.EventObject.ENTER){
						form.blur();
					}		
				}
				,scope:this
			}
		}]
	});
    MODx.tree.PackageBrowserTree.superclass.constructor.call(this,config);
	this.on('click',this.onNodeClick,this);
	this.on('beforeload',this.onBeforeLoad, this);
};
Ext.extend(MODx.tree.PackageBrowserTree,MODx.tree.Tree,{
	initEvents: function(){
		MODx.tree.PackageBrowserTree.superclass.initEvents.call(this);		
		this.getRootNode().expand();
		this.getProviderInfos();
	}
	
	,changeGProvider: false
	,changePProvider: false
	
	,getProviderInfos: function(){
		MODx.Ajax.request({
            url: this.config.url
            ,params: {
                action: 'getInfo'
                ,provider: MODx.provider
            }
            ,listeners: {
                'success': {fn:function(r) {
                    this.providerInfos = r.object;
					Ext.getCmp('modx-package-browser-home').updateDetail(this.providerInfos);
                },scope:this}
            }
        });
	}
	
	
	,setProvider: function(){		
		this.getProviderInfos();
		this.changeGProvider = true;
		this.changePProvider = true;
	}
	
	,onNodeClick: function(n,e) {		
		switch (n.attributes.type) {
			case 'repository':
				r = Ext.getCmp('modx-package-browser-repositories');
				r.activate();
				r.updateDetail(n.attributes.data);
				break;
			case 'tag':
				var tp = n.parentNode;				
				if (tp && tp.attributes.data.templated == 1) {		
					var p = Ext.getCmp('modx-package-browser-thumbs-view');
                    p.store.baseParams.tag = n.attributes.data.id;
					if(this.changePProvider){
						p.store.baseParams.provider = MODx.provider; 
						this.changePProvider = false;
					}
                    p.run();
					Ext.getCmp('modx-package-browser-view').activate(n.attributes.data.name);
				} else {
					grid = Ext.getCmp('modx-package-browser-grid');
					grid.getStore().setBaseParam('tag', n.attributes.data.id);
					grid.getStore().setBaseParam('query', '');
					if(this.changeGProvider){
						grid.getStore().setBaseParam('provider', MODx.provider); 
						grid.getStore().removeAll();
						this.changeGProvider = false;
					}
					grid.getStore().load();		
					grid.activate(n.attributes.data.name);
				}				
				break;
			default:
				home = Ext.getCmp('modx-package-browser-home');
				home.activate();
				home.updateDetail(this.providerInfos);
				break;
		}
	}
	
	,onBeforeLoad: function(node) {
		if(node.attributes.type == 'repository'){
			this.loader.baseParams.type = 'repository';
			this.loader.baseParams.id = node.attributes.id;
		} else if( node.attributes.type == 'undefined' ){
			this.getSelectionModel().select(this.root.childNodes[0]);
		}
	}
	
	,searchFor: function(name){	
		f = Ext.getCmp('package-browser-search-fld');
		f.setValue(name);
		this.search(f, name);
	}
	
	,search: function(tf, newValue) {
        var nv = newValue || tf;
		
		grid = Ext.getCmp('modx-package-browser-grid');
		grid.getStore().setBaseParam('tag', '');
		grid.getStore().setBaseParam('query', nv);
		grid.getStore().load();
		grid.activate('Search', nv);
        return true;
    }
});
Ext.reg('modx-package-browser-tree',MODx.tree.PackageBrowserTree);