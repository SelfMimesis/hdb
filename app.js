require('dotenv').config()

process.env.PRISMIC_ENDPOINT

const logger = require('morgan')
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app = express()
const path = require('path')
const port = 3000

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(errorHandler())
app.use(bodyParser.urlencoded({extended: false}))
app.use(methodOverride())
app.use(express.static(path.join(__dirname, 'public,')))

app.use(express.static('public'))

const Prismic = require('@prismicio/client');
const PrismicDOM = require('prismic-dom');
const { MethodNotAllowed } = require('http-errors')
const { allowedNodeEnvironmentFlags } = require('process')

const  initApi = req => {

  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

const handleLinkResolver= doc => {
  if (doc.type === 'product'){
    return `/detail/${doc.slug}`
  }
  if (doc.type === 'collections') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }
  return '/'
}


app.use(( req,res,next) => {
  // res.locals.ctx = {
  //   endpoint: process.env.PRISMIC_ENDPOINT,
  //   linkResolver: handleLinkResolver
  // }

  res.locals.Link= handleLinkResolver

  res.locals.Numbers = index => {
    return index == 0 ? 'One' : index == 1 ? 'Two' : index == 2 ? 'Three' : index == 3 ? 'Four' : '';
  }

  res.locals.PrismicDOM= PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', "pug")

const handleRequest = async api => {
  const meta = await api.getSingle('meta')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')


  return{
    meta,
    navigation,
    preloader
  }
}

app.get('/',  async (req, res) => {
  const api = await  initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')


  const{results: collections} = await api.query(Prismic.Predicates.at('document.type', 'collection'),{
  fetchLinks: 'product.image'
})


  res.render('pages/home', {
    ...defaults,
    collections,
    home,

  })
})



app.get('/about', async (req, res) => {
  const api = await  initApi(req)
  const about = await api.getSingle('about')
  const defaults = await handleRequest(api)

  res.render('pages/about', {
    ... defaults,
    about

  })
})


app.get('/collections', async (req, res) => {
  const api = await  initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')

  const{results: collections} = await api.query(Prismic.Predicates.at('document.type', 'collection'),{
  fetchLinks: 'product.image'
})

console.log('holamundo')
// collections.forEach(collection =>{
//   console.log(collection.data.products)
// })





console.log('holamundo')
console.log('holamundo')

  res.render('pages/collections',{
    ...defaults,
  collections,
  home


  })

})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })
  console.log('holamundo')
  console.log('holamundo')
  console.log(product.data.title[0].text)
  console.log('holamundo')
console.log('holamundo')
  res.render('pages/detail',{
    ...defaults,
    product
  })

})





app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

/*
app.get('/', (req, res) => {
  res.render('index', {
    meta:{
        data:{
          title: 'Heroes de Barrio',
          description: 'La nueva comedia familiar dirigida por Angeles Reiné'
        }

    }
  })
})
///////////////////////////////////////////////////


var createError = require('http-errors');


var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app; */
