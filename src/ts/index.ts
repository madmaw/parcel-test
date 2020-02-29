import {Thing} from './lib';
import * as ReactDOM from 'react-dom';
import { mat4, vec3 } from 'gl-matrix';
import * as gsap from 'gsap';


const colors = [
  '#000',
  '#f00',
  '#0f0',
  '#00f',
  '#ff0',
  '#0ff',
  '#f0f',
  '#f88',
  '#8f8',
  '#88f',
  '#ff8',
  '#f8f',
  '#8ff',
  '#fff',
];

window.onload = () => {
  const left = document.getElementById('left');
  const right = document.getElementById('right');
  const select = document.getElementById('select') as HTMLSelectElement;
  const onselect = (e?: Event) => {
    let value = select.value;
    if (e) {
      window.location.hash = select.value;
    } else {
      if (window.location.hash != '' && window.location.hash != null) {
        value = window.location.hash.substr(1);
        select.value = value;
      }
    }
    left.setAttribute('style', `filter: url(#red-${value})`);
    right.setAttribute('style', `filter: url(#cyan-${value})`);
    document.body.className = value;
  };
  select.onchange = onselect;
  onselect();
  const things: Thing[] = []; 
  const row = 4;
  const count = colors.length;
  for( let i=0; i<count; i++) {
    const x = (i % row - row/2) * 100;
    //const x = (i % row) * 100 + 50;
    const y = (Math.floor(i / row) ) * 100;
    const color = colors[i % colors.length];
    const thing = new Thing(
      `a${i}`,
      //'☻',
      //'@',
      color,
      color,
      undefined,
      vec3.fromValues(x, y, 0),
      vec3.fromValues(-Math.PI/2, 0, 0),
      50,
      50,
    );
    const tile = new Thing(
      `b${i}`,
      null,
      'red',
      '#444',
      vec3.fromValues(x, y, 0),
      vec3.fromValues(0, 0, 0),
    );
    things.push(thing);
    things.unshift(tile);

    //const t = new TWEEN.Tween({value: thing.rotation[2]}).to({value: Math.PI/3}, 1).repeat(10).onUpdate((({value}: {value: any}) => thing.rotation[2] = value));
    const yPosition = {y};
    const zyRotation = {
      y: -Math.PI/8,
      z: Math.PI/8,
    };
    const yRotation = {value: 0};
    const zPosition = {value: 0};
    const scale = {x: 1.1, y: 1};
    const walkTime = i+2;
    const stepRepeat = 20;
    const stepTime = walkTime / stepRepeat;
    const t = new gsap.TimelineLite().to(yPosition, walkTime, {
      y: y + 100,
      ease: 'none',
      onUpdate: () => thing.position[1] = yPosition.y,
    }).to(zyRotation, stepTime, {
      y: Math.PI/8,
      z: -Math.PI/8,
      repeat: stepRepeat,
      ease: 'power3.in.out',
      yoyo: true,
      yoyoEase: true,
      onUpdate: () => {
        thing.rotation[1] = zyRotation.y;
        thing.rotation[2] = zyRotation.z;
      },
      onComplete: () => {
        thing.rotation[1] = 0;
        thing.rotation[2] = 0;
      },
    }, 0).to(zPosition, stepTime/2, {
      value: 10,
      repeat: stepRepeat * 2,
      ease: 'power1.in',
      onUpdate: () => thing.position[2] = zPosition.value,
      onComplete: () => thing.position[2] = 0,
      yoyo: true,
      yoyoEase: true,
    }, 0).to(scale, stepTime/2, {
      x: 1,
      y: 1.2,
      repeat: stepRepeat * 2,
      ease: 'power2',
      onUpdate: () => {
        thing.scale[0] = scale.x;
        thing.scale[1] = scale.y;
      },
      onComplete: () => {
        thing.scale[0] = 1;
        thing.scale[1] = 1;
      },
      yoyo: true,
      yoyoEase: true,
    }, 0).to(yRotation, .5, {
      value: Math.PI/2,
      repeat: 0,
      onUpdate: () => thing.rotation[1] = yRotation.value,
    });

  }

  const v = {
    zRotation: Math.PI/4,
    xRotation: 0,
    x: 0, 
    y: 0,
    z: 0,
  }

  //
  //mat4.multiply(projection, projection, mat4.perspective(mat4.create(), Math.PI/3, container.clientWidth/container.clientHeight, 0, 500));

  let eyeDelta = 4;
  const keys: {[_: number]: boolean } = {};
  window.onkeydown = (e: KeyboardEvent) => {
    keys[e.keyCode] = true;
    e.preventDefault();
  };
  window.onkeyup = (e: KeyboardEvent) => {
    keys[e.keyCode] = false;
    e.preventDefault();
  };
  let previousSeconds = 0;
  const e: {
    thing: Thing,
    left: HTMLElement,
    right: HTMLElement,
  }[] = [];
  const tmp = mat4.create(); 
  const f = (seconds: number) => {
    const delta = seconds - previousSeconds;
    previousSeconds = seconds;

    const shift = keys[16];
    // left
    if (keys[37]) {
      if (shift) {
        v.x -= delta * 1000;
      } else {
        v.zRotation -= delta * Math.PI;           
      }
    }
    // right
    if (keys[39]) {
      if (shift) {
        v.x += delta * 1000;
      } else {
        v.zRotation += delta * Math.PI;
      }
    }
    // up 
    if (keys[38]) {
      if (shift) {
        v.y += delta * 1000;
      } else {
        v.z += delta * 1000;
      }
    }
    // down 
    if (keys[40]) {
      if (shift) {
        v.y -= delta * 1000;
      } else {
        v.z -= delta * 1000;
      }
    }
    // a
    if (keys[65]) {
      if (shift) {
        eyeDelta += delta;
        console.log('eye delta', eyeDelta);
      } else {
        v.xRotation += delta * Math.PI;
      }
    }
    // z 
    if (keys[90]) {
      if (shift) {
        eyeDelta -= delta;
        console.log('eye delta', eyeDelta);
      } else {
        v.xRotation -= delta * Math.PI;
      }
    }

    const projection = mat4.create();
    mat4.identity(projection);
    mat4.translate(projection, projection, [window.innerWidth/2 + v.x, window.innerHeight/2 + v.y, v.z]);
    //mat4.translate(projection, projection, [0, container.clientHeight/2, 500]);
    mat4.rotateX(projection, projection, Math.PI/2 + v.xRotation);
    mat4.rotateZ(projection, projection, v.zRotation);
    const leftProjection = mat4.multiply(mat4.create(), mat4.fromTranslation(mat4.create(), [-eyeDelta, 0, 0]), projection);
    const rightProjection = mat4.multiply(mat4.create(), mat4.fromTranslation(mat4.create(), [eyeDelta, 0, 0]), projection);

    e.forEach(e => {
      const thing = e.thing;
      thing.update(leftProjection, tmp, e.left);
      thing.update(rightProjection, tmp, e.right);
    });
  };

  things.forEach(thing => {
    const thingLeft = document.createElement('div') as HTMLElement;
    const thingRight = document.createElement('div') as HTMLElement;
    thingLeft.className = thingRight.className  = 'abs'; 
    
    left.appendChild(thingLeft);
    right.appendChild(thingRight);
    ReactDOM.render(thing.render(), thingLeft);
    ReactDOM.render(thing.render(), thingRight);

    e.push({
      thing,
      left: thingLeft,
      right: thingRight,
    })
  });

  //window.requestAnimationFrame(f);
  //TweenLite.ticker.addEventListener('tick', f);
  (gsap as any).default.ticker.add(f);

}
