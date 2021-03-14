'use strict';

let ammo_initialized = false;

const loader = new THREE.MMDLoader();

class MmdView{
  constructor(canvas, width, height, grid_enable = true, orbit_enable = true ){
    this.canvas = canvas;
    this.camera_rasio = width / height;
    this.isPaused = false;
    this.ready = false;

    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera( 45, width / height, 1, 2000 );
    this.camera.position.z = 30;

    // scene

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );

    const ambient = new THREE.AmbientLight( 0x666666 );
    this.scene.add( ambient );

    const directionalLight = new THREE.DirectionalLight( 0x887766 );
    directionalLight.position.set( - 1, 1, 1 ).normalize();
    this.scene.add( directionalLight );

    // renderer

    this.renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas, preserveDrawingBuffer: true } );
    this.resize( width, height );

    // option

    if( grid_enable ){
      const gridHelper = new THREE.PolarGridHelper( 30, 10 );
      gridHelper.position.y = - 10;
      this.scene.add( gridHelper );
    }

    if( orbit_enable ){
      const controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
//      controls.minDistance = 10;
//      controls.maxDistance = 100;
    }
  }

  setCallback(callback) {
    this.callback = callback;
  }
  
  async loadWithAnimation(modelFile, vmdFile, stageFile){
    await AmmoInit();

    if( this.mesh ){
      this.ready = false;
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
    if( this.stage ){
      this.scene.remove(this.stage);
      this.stage = null;
    }

    this.helper = new THREE.MMDAnimationHelper( {
      afterglow: 2.0,
    });

    this.mesh = await new Promise( (resolve, reject) =>{
      loader.loadWithAnimation( modelFile, vmdFile, ( mmd ) => { 
        const mesh = mmd.mesh;
        mesh.position.y = - 10;
    
        const animation = mmd.animation;
        this.helper.add( mesh, {
            animation: animation,
            physics: true
        });

        resolve(mesh);
      }, this.onProgress, reject );
    });

    this.scene.add(this.mesh);

    if( stageFile ){
      this.stage = await new Promise((resolve, reject) =>{
        loader.load( stageFile, async ( mesh ) => {
          mesh.position.y = -10;

          resolve(mesh);
        }, this.onProgress, reject );
      });

      this.scene.add(this.stage);
    }

    if( !this.ready ){
      this.ready = true;
      this.animate(this);
    }
  }

  async loadWithPose(modelFile, vpdFile, stageFile){
    await AmmoInit();

    if( this.mesh ){
      this.ready = false;
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
    if( this.stage ){
      this.scene.remove(this.stage);
      this.stage = null;
    }

    this.helper = new THREE.MMDAnimationHelper( {
      afterglow: 2.0
    });

    this.mesh = await new Promise( (resolve, reject) =>{
      loader.load( modelFile, async ( mesh ) => {    
        mesh.position.y = - 10;

        loader.loadVPD( vpdFile, false, ( vpd ) => {
          this.helper.pose(mesh, vpd);

          resolve(mesh);
        }, this.onProgress, reject );

      }, this.onProgress, reject );
    });

    this.scene.add( this.mesh );

    if( stageFile ){
      this.stage = await new Promise((resolve, reject) =>{
        loader.load( stageFile, async ( mesh ) => {
          mesh.position.y = -10;

          resolve(mesh);
        }, this.onProgress, reject );
      });

      this.scene.add(this.stage);
    }

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
      this.renderer.setSize( width, Math.floor(width / (this.camera_rasio)) );
    }else{
      this.camera_rasio = width / height;
      this.camera.aspect = this.camera_rasio;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( width, height );
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
    this.scene.remove(this.stage);
    this.renderer.dispose();
  }

  animate() {
    if( !this.ready )
      return;

    this.helper.update( this.clock.getDelta() );
    this.renderer.render( this.scene, this.camera );
    requestAnimationFrame( this.animate.bind(this) );
    
    if (this.callback)
      this.callback(this.canvas);    
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
