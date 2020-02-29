import * as React from 'react';
import { glMatrix, mat4, vec3, vec2 } from 'gl-matrix';

export class Thing {
  constructor(
    public id: string,
    private char: string,
    private fill: string,
    private background: string,
    public position: vec3,
    public rotation: vec3,
    private width = 100,
    private height = 100,
    public scale: vec3 = vec3.fromValues(1, 1, 1),
    ) {

  }

  update(projection: mat4, tmp: mat4, element: HTMLElement) {
    mat4.identity(tmp);
    mat4.translate(tmp, tmp, this.position);
    mat4.rotateX(tmp, tmp, this.rotation[0]);
    mat4.rotateY(tmp, tmp, this.rotation[1]);
    mat4.translate(tmp, tmp, [0, -this.height/2, 0]);
    mat4.rotateZ(tmp, tmp, this.rotation[2]);
    mat4.translate(tmp, tmp, [0, this.height/2, 0]);
    mat4.scale(tmp, tmp, this.scale);

    mat4.multiply(tmp, projection, tmp);
    // convert to a style
    const [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4] = tmp;
    //e.setAttribute('style', `transform: matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`);
    element.style.transform = `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
    //ReactDOM.render(t.render(), t.element);
    const filterFuncs = element.getElementsByClassName('func');
    const a = (Math.sin(this.rotation[1])+1)/2;
    const value = .75 + (1 - a * a * a)/4;
    for (const filterFunc of filterFuncs) {
      filterFunc.setAttribute('slope', `${value}`);
    }
  }

  render() {
    return <>
      <div style={{
        background: this.background || 'transparent', 
        left:-this.width/2, 
        top: -this.height/2, 
        width: this.width,
        height: this.height,
        color: this.fill,
        fontSize: this.height,
        lineHeight: `${this.height}px`,
      }}>
        {this.char != null && 
          this.char
        }
      </div>
      {/* <filter id={'b'+this.id}>
        <feComponentTransfer>
          <feFuncR type="linear" slope={1} className='func'/>
          <feFuncG type="linear" slope={1} className='func'/>
          <feFuncB type="linear" slope={1} className='func'/>
        </feComponentTransfer>
      </filter> */}
    </>;
  }
}
