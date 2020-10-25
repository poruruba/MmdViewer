'use strict';

//var vConsole = new VConsole();

const num_of_tile = 2;

var pmx_list = [
    {
        fname: 'mmd/Mirai_Akari_v1.0/MiraiAkari_v1.0.pmx',
        title: 'ミライアカリ'
    },
    {
        fname: 'mmd/kizunaai/kizunaai.pmx',
        title: 'キヅナアイ'
    },
    {
        fname: 'mmd/miku/miku_v2.pmd',
        title: '初音ミク'
    },
    {
        fname: 'mmd/ando/安柏.pmx',
        title: 'アンバー'
    },
    {
        fname: 'mmd/wendi/温迪.pmx',
        title: 'ウエンティ'
    },
    {
        fname: 'mmd/kaiya/凯亚.pmx',
        title: 'ガイア'
    },
    {
        fname: 'mmd/qin/琴.pmx',
        title: 'ジン'
    },
    {
        fname: 'mmd/diluke/迪卢克.pmx',
        title: 'ディルック'
    },
    {
        fname: 'mmd/babala/芭芭拉.pmx',
        title: 'バーバラ'
    },
    {
        fname: 'mmd/paimeng/派蒙.pmx',
        title: 'パイモン'
    },
    {
        fname: 'mmd/feixieer/菲谢尔.pmx',
        title: 'フィッシュル'
    },
    {
        fname: 'mmd/lisha/丽莎.pmx',
        title: 'リサ'
    },
    {
        fname: 'mmd/ningguang/凝光.pmx',
        title: '凝光'
    },
    {
        fname: 'mmd/kong/空.pmx',
        title: '空'
    },
    {
        fname: 'mmd/ying/女主角.pmx',
        title: '蛍'
    },
    {
        fname: 'mmd/xiangling/香菱.pmx',
        title: '香菱'
    },
];

var vmd_base = "mmd/vmds/";
var vmd_list = [
    "wavefile_v2.vmd",
    "wavefile_camera.vmd",
];

var vpd_base = "mmd/vpds/";
var vpd_list = [
    "01.vpd",
    "02.vpd",
    "03.vpd",
    "04.vpd",
    "05.vpd",
    "06.vpd",
    "07.vpd",
    "08.vpd",
    "09.vpd",
    "10.vpd",
    "11.vpd",
];

var vue_options = {
    el: "#top",
    data: {
        progress_title: '', // for progress-dialog

        character_list: pmx_list,
        animation_list: vmd_list,
        pose_list: vpd_list,
        selecting: [],
        num_of_tile: num_of_tile,
        selecting_type: [],
    },
    computed: {
    },
    methods: {
        open: function(index){
            var select = this.selecting[index];
            var param = "pmx=" + encodeURIComponent(this.character_list[select.index].fname);
            param += "&type=" + this.selecting_type[index];
            if( this.selecting_type[index] == 'vmd')
                param += "&vmd=" + encodeURIComponent(vmd_base + this.animation_list[select.vmd_index]);
            else if( this.selecting_type[index] == 'vpd' )
                param += "&vpd=" + encodeURIComponent(vpd_base + this.pose_list[select.vpd_index]);
            
            window.open("fullsize.html?" + param, this.character_list[this.selecting[index].vmd_index].title);
        },
        save: async function(index){
            var canvas = $('#canvas_' + index)[0];

            var a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.85);
            a.download = 'snapshot.jpg';
            a.click();
            window.URL.revokeObjectURL(a.href);
        },
        pause_resume: async function(index){
            var select = this.selecting[index];
            if( !select.pause ){
                select.mmd.pause_animate();
                select.pause = true;
            }else{
                select.mmd.start_animate();
                select.pause = false;
            }
        },
        select_change: async function(index){
            var select = this.selecting[index];
            if( select.index < 0 )
                return;

            try{
                if( this.selecting_type[index] == 'vmd'){
                    await select.mmd.loadWithAnimation(
                        this.character_list[select.index].fname, vmd_base + this.animation_list[select.vmd_index]);
                }else if( this.selecting_type[index] == 'vpd'){
                    await select.mmd.loadWithPose(
                        this.character_list[select.index].fname, vpd_base + this.pose_list[select.vpd_index]);
                }
            }catch(error){
                console.error(error);
                alert(error);
            }
        },
    },
    created: function(){
        for( var i = 0 ; i < this.num_of_tile ; i++ ){
            this.selecting[i] = {
                index: -1,
                mmd: null,
                pause: false,
                vmd_index: 0,
                vpd_index: 0
            };
            this.selecting_type[i] = "vmd";
        }
    },
    mounted: async function(){
        proc_load();

        for( let i = 0 ; i < this.num_of_tile ; i++ ){
            var base = $('#base_' + i);
            this.selecting[i].mmd = new MmdView($('#canvas_' + i)[0], base.width(), base.width() );
            window.addEventListener( 'resize', function(){
                var base = $('#base_' + i);
                this.selecting[i].mmd.resize(base.width())
            }.bind(this), false );
        }
    }
};
vue_add_methods(vue_options, methods_bootstrap);
vue_add_components(vue_options, components_bootstrap);
var vue = new Vue( vue_options );
