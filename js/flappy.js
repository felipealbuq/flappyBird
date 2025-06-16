function novo_elemento(tagName,className){
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barreira(reversa = false){
    this.elemento = novo_elemento('div','barreira')

    const borda = novo_elemento('div','borda')
    const corpo = novo_elemento('div','corpo')
    this.elemento.appendChild(reversa? corpo:borda)
    this.elemento.appendChild(reversa?borda:corpo)

    this.setAltura = altura =>corpo.style.height = `${altura}px`

}
// const b = new Barreira(true)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function par_de_barreiras(altura,abertura,x){
    this.elemento = novo_elemento('div','par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortear_abertura = () =>{
        const altura_superior = Math.random() * (altura-abertura)
        const altura_inferior = altura - abertura - altura_superior
        this.superior.setAltura(altura_superior)
        this.inferior.setAltura(altura_inferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortear_abertura()
    this.setX(x)
}

// const b = new par_de_barreiras(700,200,400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura,largura,abertura,espaco,notificar_ponto){
    this.pares = [
        new par_de_barreiras(altura,abertura,largura),
        new par_de_barreiras(altura,abertura,largura + espaco),
        new par_de_barreiras(altura,abertura,largura + espaco *2),
        new par_de_barreiras(altura,abertura,largura + espaco *3)

    ]
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortear_abertura()
            }
            const meio = largura/2
            const cruzou_o_meio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            cruzou_o_meio && notificar_ponto()
        })
    }
}

function Passaro(altura_jogo){
    let voando = false

    this.elemento = novo_elemento('img','passaro')
    this.elemento.src = 'imgs/Uranio.png' 

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false
    window.ontouchstart = e => voando = true
    window.ontouchend = e => voando = false

    
    this.animar = () => {
        const novoY = this.getY() + (voando ? 7 : -4)
        const altura_maxima = altura_jogo - this.elemento.clientHeight

        if(novoY <=0){
            this.setY(0)
        }else if (novoY >= altura_maxima){
            this.setY(altura_maxima)
        }else{
            this.setY(novoY)
        }
    }
    this.setY(altura_jogo / 2)


}
    

function Progresso(){
    this.elemento = novo_elemento('span','progresso')
    this.atualizar_pontos = pontos =>{
        this.elemento.innerHTML = pontos
    }
    this.atualizar_pontos(0)
}

// const barreiras = new Barreiras(700,1100,200,400)
// const passaro = new Passaro(700)
// const area_do_jogo = document.querySelector('[wm-flappy]')
// area_do_jogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => area_do_jogo.appendChild(par.elemento))
// setInterval(()=>{
//     barreiras.animar()
//     passaro.animar()
// },25)
// // area_do_jogo.appendChild(new Progresso().elemento)

function estao_sobrepostos(elementoA,elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    
     const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical

}

function colidiu(passaro,barreiras){
    let colidiu = false
    barreiras.pares.forEach(par_de_barreiras =>{
        if(!colidiu){
            const superior = par_de_barreiras.superior.elemento
            const inferior = par_de_barreiras.inferior.elemento
            colidiu = estao_sobrepostos(passaro.elemento,superior)
                || estao_sobrepostos(passaro.elemento,inferior)
        }
    })
    return colidiu
}

function FlappyBird(){
    let pontos = 0

    const area_do_jogo = document.querySelector('[wm-flappy]')
    const altura = area_do_jogo.clientHeight
    const largura = area_do_jogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura,largura,200,400,
        ()=> progresso.atualizar_pontos(++pontos))
    const passaro = new Passaro(altura)    

    area_do_jogo.appendChild(progresso.elemento)
    area_do_jogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par=>area_do_jogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(()=>{
            barreiras.animar()
            passaro.animar()
            if(colidiu(passaro,barreiras)){
                clearInterval(temporizador)
            }
        },20)
    }
}

new FlappyBird().start()