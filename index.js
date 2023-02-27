const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
const MOVIES_PER_PAGE = 12
let filteredMovies = [] //search results
let display = 'card' //display mode
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayBtn = document.querySelector('.display-icon')

// adopt MVC
const model = {

  getMovieModal(id) {
    axios
      .get(INDEX_URL + id)
      .then((response) => {
        const data = response.data.results
        view.renderMovieModal(data)
      })
  },

  getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  },

  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find((movie) => movie.id === id)

    if (list.some((movie) => movie.id === id)) {
      return alert('此電影已經在收藏清單中！')
    }

    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
}

const view = {

  renderMovieList(data, display) {
    if (display === 'list') {
      this.displayList(data)
    } else if (display === 'card') {
      this.displayCard(data)
    }
  },

  displayList(data) {
    let rawHTML = '<ul class="list-group list-group-flush">'
    data.forEach((item) => {
      rawHTML += `
      
      <li class="list-group-item d-flex justify-content-between">
        <div>${item.title}</div>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
        </div>
      </li>
      
    `
    })
    rawHTML += `</ul >`
    dataPanel.innerHTML = rawHTML
  },

  displayCard(data) {
    let rawHTML = ''
    data.forEach((item) => {
      // title, image, id
      rawHTML +=
        `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = rawHTML
  },

  renderMovieModal(data) {
    // get elements
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  },

  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    const moviesAmount = document.querySelector('#movies-amount')
    let rawHTML = ''

    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML
    moviesAmount.innerHTML = amount
  },

  highlightPaginator(id) {
    const page = document.querySelectorAll('.page-link')
    page.forEach((e) => {
      e.parentElement.classList.remove('active')
      if (e.dataset.page === id) {
        console.log(id)
        e.parentElement.classList.add('active')
      }
    })
  },

  highlightDisplayBtn(display) {
    let mode = document.querySelector(`#${display}`)
    if (mode.classList.contains('on')) return

    let card = document.querySelector(`#card`)
    let list = document.querySelector(`#list`)
    card.classList.toggle('on')
    list.classList.toggle('on')
  },

  //讓已收藏清單的按鈕顯眼，此功能尚待修改
  highlightFavorite(btn) {
    btn.classList.add('btn-danger')
  }

}

const controller = {

  start() {
    view.renderMovieList(movies, display)
    view.renderPaginator(movies.length)
    view.renderMovieList(model.getMoviesByPage(1), display)
    view.highlightPaginator('1')
  },

  onPanelClicked(event) {
    const target = event.target
    if (target.matches('.btn-show-movie')) {
      model.getMovieModal(target.dataset.id)
    } else if (target.matches('.btn-add-favorite')) {
      model.addToFavorite(Number(target.dataset.id))
      view.highlightFavorite(target)
    }
  },

  onSearchFormSubmitted(event) {
    event.preventDefault() //新增這裡，避免按下 submit button 的時候瀏覽器自動重新整理

    const keyword = searchInput.value.trim().toLowerCase()

    filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(keyword)
    )

    if (filteredMovies.length === 0) {
      return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }

    view.renderPaginator(filteredMovies.length)
    view.renderMovieList(model.getMoviesByPage(1), display)
  },

  onPaginatorClicked(event) {
    if (event.target.tagName !== 'A') return

    currentPage = Number(event.target.dataset.page)
    view.renderMovieList(model.getMoviesByPage(currentPage), display)
    view.highlightPaginator(event.target.dataset.page)
  },

  onDisplayBtnClicked(event) {
    if (event.target.id === 'list') {
      display = 'list'
    } else if (event.target.id === 'card') {
      display = 'card'
    }
    view.renderMovieList(model.getMoviesByPage(currentPage), display)
    view.highlightDisplayBtn(display)
  }

}

// listeners
dataPanel.addEventListener('click', controller.onPanelClicked)
displayBtn.addEventListener('click', controller.onDisplayBtnClicked)
searchForm.addEventListener('submit', controller.onSearchFormSubmitted)
paginator.addEventListener('click', controller.onPaginatorClicked)

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    controller.start()
  })
  .catch((err) => console.log(err))