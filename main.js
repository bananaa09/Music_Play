const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const heading = $('header h2')
const cbThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    
    songs: [
        {
            name: 'Bước qua nhau',
            singer: 'Vũ',
            path: './assets/music/music7.mp3',
            image: 'https://kenh14cdn.com/2017/13-1500658882505-266-105-1040-1400-crop-1500659329779.jpg'
        },
        {
            name: 'cưới thôi',
            singer: 'Masew x Masiu x Bray x TAP',
            path: './assets/music/music10.mp3',
            image: './assets/music/img1.jpg'
        },
        {
            name: 'Độ tộc 2',
            singer: 'MASEW X PHÚC DU X PHÁO X ĐỘ MIXI',
            path: './assets/music/music11.mp3',
            image: 'https://data.chiasenhac.com/data/cover/145/144706.jpg'
        },
        {
            name: 'Xin một lần ngoại lệ (Cover)',
            singer: 'Vũ',
            path: './assets/music/music17.mp3',
            image: './assets/music/Ech.png'
        },
        {
            name: 'Sài GÒn Hôm Nay Mưa',
            singer: 'Vũ',
            path: './assets/music/music13.mp3',
            image: 'https://kenh14cdn.com/2017/13-1500658882505-266-105-1040-1400-crop-1500659329779.jpg'
        },


    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
       const htmls = this.songs.map((song, index) => {
           return `
           <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                   <h3 class="title">${song.name}</h3>
                   <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
           `
       })
       playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        }) 

    },
    handleEvent: function() {
        const _this = this
        const cdWidth = cd.offsetWidth
        //Xử lí CD quay / dừng
        const cdThumbAnimate = cbThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 second
            iterations: Infinity
        })
        cdThumbAnimate.pause()


        //Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth

        }
        // xử lý khi click play / pause
        playBtn.onclick = function() {
            if (_this.isPlaying){
                _this.isPlaying = false
                audio.pause()
                player.classList.remove('playing')
                cdThumbAnimate.pause()

            } else {
                _this.isPlaying = true
                audio.play()
                player.classList.add('playing')
                cdThumbAnimate.play()
            }
            //Khi tieens độ bài hát thay đổi
            audio.ontimeupdate = function() {
                if (audio.duration) {
                    const currentProgress = Math.floor(audio.currentTime / audio.duration * 100)
                    progress.value = currentProgress

                }
            }
            //Xưe lý khi tua song
            progress.oninput = function(e) {
                const seekTime = audio.duration / 100 * e.target.value
                audio.currentTime = seekTime
            }
        }
        // Khi next song 
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }
        // Xứ lý bật / tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)

        }
        // Xử lý phát lại một bài hát 
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
               audio.play()
            } else {
                nextBtn.click()
            }
        }
        // Lắng nghe click playlist
        playlist.onclick = function(e) {
            // Xuqr lí khi click vào song
            const songNode = e.target.closest('.song:not(.active)')
              if (songNode || e.target.closest('.option')) {
                    if (songNode ) {
                        _this.currentIndex = Number(songNode.dataset.index)
                        _this.loadCurrenSong()     
                        _this.render()
                        audio.play()      
                    }
                    if(e.target.closest('.option')) {

                    }
              }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },
    loadCurrenSong: function() {
          heading.textContent = this.currentSong.name
          cbThumb.style.backgroundImage = `url('${this.currentSong.image}')`
          audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        // Object.assign(this, this.config)
    },
    nextSong: function() {

        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrenSong()
    },
    prevSong: function() {

        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrenSong()
    },
    playRandomSong: function() {
        let newIndex
          do{
            newIndex = Math.floor(Math.random() * this.songs.length)
          } while (newIndex === this.currentIndex)
          this.currentIndex = newIndex
          this.loadCurrenSong()

    },
    start: function() {
    //Gan cấu hình từ config vào ứng dụng
     this.loadConfig()
    // Định nghãi các thuộc tính cho Object
     this.defineProperties()

     //Lắng nghe / xử lí các sự kiện
     this.render()

  
     //Tải thành tin bài hát đầu tiên vài UI khi chạy ứng dụng 
     this.loadCurrenSong()
    

     //render playlist
     this.handleEvent()
     //Hiênt thị trạng thái
    //  randomBtn.classList.toggle('active', this.isRandom)
    //  repeatBtn.classList.toggle('active', this.isRepeat)
    }
}
app.start()