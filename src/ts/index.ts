import {Thing} from './lib';
import * as ReactDOM from 'react-dom';
import { mat4, vec3 } from 'gl-matrix';
import * as gsap from 'gsap';

window.onload = () => {
  const svg = document.getElementById('svg');
  const things: Thing[] = [];
  const row = 15;
  for( let i=0; i<200; i++) {
    const x = (i % row) * 100 - 300;
    const y = Math.floor(i / row) * 100 - 300;
    const thing = new Thing(
      `a${i}`,
      //'☻',
      '@',
      'magenta',
      undefined,
      vec3.fromValues(x, y, 0),
      vec3.fromValues(-Math.PI/2, 0, 0),
      50,
      50,
    );
    const tile = new Thing(
      `b${i}`,
      ' ',
      'red',
      'black',
      vec3.fromValues(x, y + 100, 0),
      vec3.fromValues(0, 0, 0),
    );
    things.push(thing);
    things.unshift(tile);

    //const t = new TWEEN.Tween({value: thing.rotation[2]}).to({value: Math.PI/3}, 1).repeat(10).onUpdate((({value}: {value: any}) => thing.rotation[2] = value));
    const yPosition = {y};
    const zyRotation = {
      //z: -Math.PI/16,
      y: -Math.PI/32,
    };
    const yRotation = {value: 0};
    const zPosition = {value: -10};
    const scale = {x: 1.1, y: 1};
    const walkTime = i+2;
    const stepRepeat = 20;
    const stepTime = walkTime / stepRepeat;
    const t = new gsap.TimelineLite().to(yPosition, walkTime, {
      y: y + 100,
      ease: 'none',
      onUpdate: () => thing.position[1] = yPosition.y,
    }).to(zyRotation, stepTime, {
      y: Math.PI/32,
      //z: Math.PI/16,
      repeat: stepRepeat,
      ease: 'power2.in',
      yoyo: true,
      yoyoEase: true,
      onUpdate: () => {
        thing.rotation[1] = zyRotation.y;
        //thing.rotation[2] = zyRotation.z;
      },
      onComplete: () => {
        thing.rotation[1] = 0;
        thing.rotation[2] = 0;
      },
    }, 0).to(zPosition, stepTime/2, {
      value: 0,
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
  const projection = mat4.create();
  mat4.identity(projection);
  mat4.translate(projection, projection, [200, 200, 0]);
  mat4.rotateX(projection, projection, Math.PI/3);
  mat4.rotateZ(projection, projection, Math.PI/5);
  const tmp = mat4.create();
  const f = (time: number) => {
    things.forEach(t => {
      if (t.element == null) {
        return;
      }
      t.update(projection, tmp);
    });
  };

  things.forEach(thing => {
    const g = document.createElementNS(svg.namespaceURI, 'g') as HTMLElement;
    thing.element = g;
    svg.appendChild(g);
    ReactDOM.render(thing.render(), g);
  });

  //window.requestAnimationFrame(f);
  //TweenLite.ticker.addEventListener('tick', f);
  (gsap as any).default.ticker.add(f);

}
