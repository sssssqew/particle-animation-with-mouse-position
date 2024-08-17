const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth * window.devicePixelRatio
canvas.height = window.innerHeight * window.devicePixelRatio

canvas.style.width = `${window.innerWidth}px`
canvas.style.height = `${window.innerHeight}px`

class Particle{
    constructor(x, y, effect){
        this.originX = x
        this.originY = y 
        this.effect = effect 
        this.x = Math.floor(x)
        this.y = Math.floor(y)
        this.ctx = effect.ctx 
        this.ctx.fillStyle = 'white' // 파티클 색상
        this.vx = 0
        this.vy = 0
        this.ease = 0.2
        this.friction = 0.95
        this.dx = 0
        this.dy = 0
        this.distance = 0 // 마우스와 파티클 사이의 간격
        this.force = 0
        this.angle = 0 // 파티클이 어느 방향으로 움직일지 결정
        this.size = Math.floor(Math.random()*5) // 파티클 크기
        this.draw()
    }
    draw(){
        this.ctx.beginPath()
        this.ctx.fillRect(this.x, this.y, this.size, this.size)
    }
    update(){
        this.dx = this.effect.mouse.x - this.x // 마우스와 파티클의 x축 거리
        this.dy = this.effect.mouse.y - this.y // 마우스와 파티클의 y축 거리
        this.distance = this.dx * this.dx + this.dy * this.dy 
        this.force = -this.effect.mouse.radius / this.distance * 8 // 마우스와 멀리 떨어진 파티클은 당기는 힘이 작고, 가까운 파티클은 당기는 힘이 크다
        
        // this.effect.mouse.radius : 파티클이 움직이는 범위를 제한 
        // 파티클이 마우스 포인트에 가까울수록 속도와 위치가 많이 변한다
        if(this.distance < this.effect.mouse.radius){ // 파티클이 마우스 포인트에 가까이 위치한 경우
            this.angle = Math.atan2(this.dy, this.dx)
            this.vx += this.force * Math.cos(this.angle) // 파티클에 주어진 힘의 x 성분을 x방향 속도에 더함
            this.vy += this.force * Math.sin(this.angle) // 파티클에 주어진 힘의 y 성분을 y방향 속도에 더함
        }
        // friction 이 0.95이므로 this.vx 의 95%만 위치변화에 반영한다.
        // 계산의 편의를 위해 Math.floor 를 하였지만, 실제 위치를 구할때는 this.originX - this.x 만큼 더해줘서 원래 파티클 위치에서 위치를 변경할 수 있도록 한다.
        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease 
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease 
        this.draw() // 업데이트된 위치로 파티클을 다시 그림  
    }
}

class Effect{
    constructor(width, height, context){
        this.width = width 
        this.height = height 
        this.ctx = context 
        this.particlesArray = []
        this.gap = 20 // 픽셀 간격
        this.mouse = {
            radius: 3000, 
            x: 0, 
            y: 0
        }
        // clientY : 브라우저 상단 기준
        // pageY : 전체문서 상단 기준
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX * window.devicePixelRatio // 선명한 해상도를 위해
            this.mouse.y = e.pageY * window.devicePixelRatio
            console.log(this.mouse.x, this.mouse.y)
        })
        window.addEventListener('resize', () => { // 디바이스 사이즈에 맞게 캔버스 크기 조정
            canvas.width = window.innerWidth * window.devicePixelRatio
            canvas.height = window.innerHeight * window.devicePixelRatio

            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`

            this.width = canvas.width 
            this.height = canvas.height 

            // this.gap = window.innerWidth / 100 // 파티클 사이 간격을 디바이스 너비의 1%로 설정
            this.particlesArray = [] // 파티클을 다시 그리기 위해 초기화
            this.init() // 화면 사이즈 변경시 다시 설정 (화면 사이즈가 바뀌면 파티클 갯수가 달라지므로 파티클을 새로 생성함)
        })
        this.init() // construnctor 실행시 초기에 한번 설정
    }
    init(){ // 파티클 생성 및 배열에 추가
        for(let x=0; x<this.width; x+=this.gap){
            for(let y=0; y<this.height; y+=this.gap){
                this.particlesArray.push(new Particle(x, y, this))
            }
        }
    }
    // 전체 파티클 위치 업데이트 
    update(){
        this.ctx.clearRect(0, 0, this.width, this.height) // 캔버스 전부 지우기
        for(let i=0; i<this.particlesArray.length; i++){
            this.particlesArray[i].update() // 마우스 포인트에 따라 파티클 하나의 위치 업데이트
        }
    }
}

let effect = new Effect(canvas.width, canvas.height, ctx)

function animate(){
    effect.update()
    requestAnimationFrame(animate)
}
animate()
