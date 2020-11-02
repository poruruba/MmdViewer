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
    },
    created: function(){
    },
    mounted: function(){
        proc_load();
    }
};
vue_add_methods(vue_options, methods_bootstrap);
vue_add_components(vue_options, components_bootstrap);
var vue = new Vue( vue_options );
