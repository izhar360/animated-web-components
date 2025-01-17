import AnimationElement from "./animation-element.js";

class FloatingRandomElement extends AnimationElement {
    /**
     * @type {Object<String, Array<Function>>}
     */
    #eventListeners = {}
    constructor(){
        super();
        this.attachShadow({mode: 'open'})
    }
    get travelRadius(){
        return parseInt(this.getAttribute('travel-radius')) || 10;
    }
    connectedCallback(){
        this.render()
    }
    render(){
        this.shadowRoot.innerHTML = ""
        const style = document.createElement('style');
        style.innerHTML = `
            :host{
                position: absolute;
                top: 0px;
                left: 0px;
                transition: ${this.animationSpeed/1000 + 0.2*Math.random()}s linear;
            }
        `;
        this.shadowRoot.append(style);
        this.shadowRoot.append(document.createElement('slot'));

        this.addEventListener('click', ()=>{
            if(this.getAttribute('clonable') != 'false') this.cloneNode()
        })

    }
    animate(){
        // console.log("Hi")
        const o_x = parseFloat( this.style.left ) || 0;
        const o_y = parseFloat( this.style.top ) || 0;
        const radius = this.travelRadius;
        let angle, x, y;
        do {
            angle = Math.random()*2*Math.PI;
            x = o_x + radius*Math.sin(angle);
            y = o_y + radius*Math.cos(angle);
        } while (x > this.parentElement.offsetWidth || y > this.parentElement.offsetHeight || x < 0 || y < 0);
        this.style.left = x + 'px';
        this.style.top = y + 'px';
        return {angle, x, y};
    }
    addClonableEventListener(event, callback, options){
        console.log('Added'); 
        if(this.#eventListeners[event] == undefined) this.#eventListeners[event] = []
        this.#eventListeners[event].push(callback);
        super.addEventListener(event, callback)
    }
    cloneNode(){
        let clone = super.cloneNode(true);
        for(let event in this.#eventListeners){
            for(let callback of this.#eventListeners[event]){
                clone.addClonableEventListener(event, callback.bind(clone))
            }
        }
        this.parentElement.append(clone);
        this.dispatchEvent(new CustomEvent('clone', {
            detail: {node: clone, content: clone.shadowRoot.querySelector('slot').assignedElements()[0]}
        }))
    }
    reset(){

    }
}

customElements.define('floating-random-element', FloatingRandomElement)