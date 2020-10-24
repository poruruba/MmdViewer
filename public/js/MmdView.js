'use strict';

import * as THREE from '../dist/build/three.module.js';

import { OrbitControls } from '../dist/js/jsm/controls/OrbitControls.js';
import { OutlineEffect } from '../dist/js/jsm/effects/OutlineEffect.js';
import { MMDLoader } from '../dist/js/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from '../dist/js/jsm/animation/MMDAnimationHelper.js';

let ammo_initialized = false;

const loader = new MMDLoader();

class MmdView{
  constructor(canvas, width, height){
    this.camera_rasio = width / height;
    this.isPaused = false;
    this.ready = false;

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera( 45, width / height, 1, 2000 );
    this.camera.position.z = 30;

    // scene

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );

    const gridHelper = new THREE.PolarGridHelper( 30, 10 );
    gridHelper.position.y = - 10;
    this.scene.add( gridHelper );

    const ambient = new THREE.AmbientLight( 0x666666 );
    this.scene.add( ambient );

    const directionalLight = new THREE.DirectionalLight( 0x887766 );
    directionalLight.position.set( - 1, 1, 1 ).normalize();
    this.scene.add( directionalLight );

    // renderer

    this.renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas, preserveDrawingBuffer: true } );
    this.effect = new OutlineEffect( this.renderer );
    this.resize( width, height );

    // model

    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.minDistance = 10;
    controls.maxDistance = 100;
  }

  async loadWithAnimation(modelFile, vmdFile){
    await AmmoInit();

    await new Promise( (resolve, reject) =>{
      loader.loadWithAnimation( modelFile, vmdFile, ( mmd ) => {
        if( this.mesh ){
          this.ready = false;
          this.scene.remove(this.mesh);
          this.mesh = null;
        }
    
        this.helper = new MMDAnimationHelper( {
          afterglow: 2.0,
        });
    
        this.mesh = mmd.mesh;
        this.mesh.position.y = - 10;
        this.scene.add( this.mesh );
    
        this.animation = mmd.animation;
        this.helper.add( this.mesh, {
            animation: this.animation,
            physics: true
        });
          
        resolve();
      }, this.onProgress, reject );
    });

    if( !this.ready ){
      this.ready = true;
      this.animate(this);
    }
}

  async loadWithPose(modelFile, vpdFile){
    await AmmoInit();

    await new Promise( (resolve, reject) =>{
      loader.load( modelFile, ( mesh ) => {
        if( this.mesh ){
          this.ready = false;
          this.scene.remove(this.mesh);
          this.mesh = null;
        }
    
        this.helper = new MMDAnimationHelper( {
          afterglow: 2.0
        });
    
        this.mesh = mesh;
        this.mesh.position.y = - 10;
        this.scene.add( this.mesh );
    
        resolve();
      }, this.onProgress, reject );
    });

    await new Promise( (resolve, reject) =>{
      loader.loadVPD( vpdFile, false, ( vpd ) => {
        this.vpd = vpd;
        this.helper.pose(this.mesh, vpd);
        resolve();
      }, this.onProgress, reject );
    });

    if( !this.ready ){
      this.ready = true;
      this.animate();
    }
  }

  onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
    }
  }

  resize(width, height) {
    if( height === undefined ){
      this.effect.setSize( width, Math.floor(width / (this.camera_rasio)) );
    }else{
      this.camera_rasio = width / height;
      this.camera.aspect = this.camera_rasio;
      this.camera.updateProjectionMatrix();
      this.effect.setSize( width, height );
    }
  }

  pause_animate(){
    if( !this.isPaused ){
      this.isPaused = true;
      this.clock.stop();
    }
  }

  start_animate(){
    if( this.isPaused ){
      this.isPaused = false;
      this.clock.start();
    }
  }

  dispose(){
    this.ready = false;
    this.scene.remove(this.mesh);
    this.renderer.dispose();
  }

  animate() {
    if( !this.ready )
      return;

    requestAnimationFrame( this.animate.bind(this) );
    this.helper.update( this.clock.getDelta() );
    this.effect.render( this.scene, this.camera );
  }
}

async function AmmoInit(){
  if( ammo_initialized )
      return;
  return new Promise((resolve, reject) =>{
      Ammo().
      then( function ( AmmoLib ) {
        Ammo = AmmoLib;
        ammo_initialized = true;
        resolve();
      })
      .catch(error =>{
        reject(error);
      });
  });
}

export { MmdView };
