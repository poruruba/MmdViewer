'use strict';

//var vConsole = new VConsole();

var vue_options = {
    el: "#top",
    data: {
        progress_title: '', // for progress-dialog
    },
    computed: {
    },
    methods: {
        KeyUpFunc: function(e){
            if( !e )
                return;
            
            console.log(e);
            if( e.key == 'Enter'){
                var canvas = $('#canvas_0')[0];
        
                var a = document.createElement('a');
                a.href = canvas.toDataURL('image/jpeg', 0.85);
                a.download = 'snapshot.jpg';
                a.click();
                window.URL.revokeObjectURL(a.href);
            }else if( e.key == ' ' ){
                if( !this.mmd.isPaused ){
                    this.mmd.pause_animate();
                }else{
                    this.mmd.start_animate();
                }
            }
        }
    },
    created: function(){
    },
    mounted: async function(){
        proc_load();


        try{
	        this.mmd = new MmdView($('#canvas_0')[0], window.innerWidth, window.innerHeight );
	        window.addEventListener( 'resize', function(){
	            this.mmd.resize(window.innerWidth, window.innerHeight)
	        }.bind(this), false );
	        
            if( searchs.type == 'vmd'){
                await this.mmd.loadWithAnimation( decodeURIComponent(searchs.pmx), decodeURIComponent(searchs.vmd), searchs.stage ? decodeURIComponent(searchs.stage) : "");
            }else if( searchs.type == 'vpd'){
                await this.mmd.loadWithPose( decodeURIComponent(searchs.pmx), decodeURIComponent(searchs.vpd), searchs.stage?decodeURIComponent(searchs.stage) :"");
            }
        }catch(error){
            console.error(error);
            alert(error);
        }

        document.addEventListener("keyup", this.KeyUpFunc);
    }
};
var vue = new Vue( vue_options );
