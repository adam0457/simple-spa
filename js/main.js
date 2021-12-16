
'use strict';
document.addEventListener('DOMContentLoaded', init);

/** My global variables */
let queryActor;
let actorsArr = [];
let secureBaseUrl;
let logoSize;
let posterSize;
let profileSize;
const APIKEY = '75789c3f5ba1cec6147292baa65a1ecc';
let cards = document.querySelector('.cards');
let cardsMedia = document.querySelector('.cards-media');
let inputName = document.querySelector('#search');
let back = document.querySelector('.btn-back');
let nameElement = document.querySelector('.name');
let popularityElement = document.querySelector('.popularity');
let urlConfig = `https://api.themoviedb.org/3/configuration?api_key=${APIKEY}`;



/** This will initialize the app  */

function init() { 
  /** Those are some events that we will need to handle navigation and sorting by name and popularity */
  window.addEventListener('popstate', popFunction);
  back.addEventListener('click', goBack);  // This is for the back button which is an anchor tag.
  nameElement.addEventListener('click', sortByName);
  popularityElement.addEventListener('click', sortByPopularity);

  /** We're making the instruction page the default page */
  activateSection('#instructions');

  /** This is for when we need to go back to the home page */
  let h1 = document.querySelector('h1');
  h1.addEventListener('click', (ev) => {activateSection('#instructions');})

  /** Clicking on the search button or pressing enter from the input text will run the search function  */
  let btnSearch = document.querySelector('#btnSearch');
  btnSearch.addEventListener('click', search);
  inputName.addEventListener('keydown', (ev) => {
    if(ev.key === 'Enter'){
      ev.preventDefault();
      search(ev);
    }
  });
  /** This function will fetch the configuration infos from the api once the page is loaded 
   * and put some of them in global variables 
   * */
  getConfig();
}

function getConfig(){
  fetch(urlConfig)
  .then(response => {
    return response.json();
  })
  .then(data => {
     /** I need those info from the configuration fetch to display the images later on */
      secureBaseUrl = data.images.secure_base_url;
      logoSize = data.images.logo_sizes[6];
      posterSize = data.images.poster_sizes[2];
      profileSize = data.images.profile_sizes[1];
  })
  .catch(err => {
    alert(err);
  })
  
}

/** This function will make the search based on the value of the text field. 
 * It will call the function getActor() 
 * */
function search(ev){
  ev.preventDefault();
  queryActor = inputName.value;
  if(queryActor !== ''){
    getActors(queryActor);
    history.pushState(null,' ', `#${queryActor}`);
  }
  else {alert('You did not enter any name')}

  inputName.value = '';    
}


function getActors(searchString){
  let stringData = localStorage.getItem(searchString);
  if(stringData){
    let dataFromLocaleStorage = JSON.parse(stringData);
    actorsArr = dataFromLocaleStorage;
    displayCards(actorsArr, 'actor');
  }else{
    let urlActor =` https://api.themoviedb.org/3/search/person?api_key=${APIKEY}&query=${searchString}`;
    fetchActor(urlActor);
  }
}

function fetchActor(url){
  fetch(url)
  .then(response => {
    return response.json();
  }).then(data => {
    actorsArr = data.results;
    localStorage.setItem(queryActor, JSON.stringify(actorsArr));
    /** The function fetchActor is using the displayCards function to display the info of 
     * the actors(photo, name and a number of stars emoji based on his popularity)
     * 
     */
    displayCards(actorsArr, 'actor');
    
  }).catch(err => {
    alert(err);
  })
}

/** This function is used to activate a section (page) and also deactivate 
 * the others if there was any other activated one 
 */
function activateSection(sectionId){
  let sectionToActivate = document.querySelector(sectionId);
  let otherSectionActive = document.querySelectorAll('.active');
  if(otherSectionActive.length > 0){
    otherSectionActive.forEach(sect => {
      sect.classList.remove('active');
    })
  }
  sectionToActivate.classList.add('active');
  
}

/** 
 * actorDetails() is called when the user clicks on an actor, media() will grab all the 
 * info regarding this actor from the global array actorsArr[] and displayCards() will display the results.
 *   
 * */

function actorDetails(ev){
  let actorClicked = ev.currentTarget;   
  let id = actorClicked.getAttribute('id');
  media(id);
  let hash = location.hash;
  history.pushState({'actor': id}, '', `${hash}/${id}`)
  
}


function media(actor){
  let actorId = actor;
  let actorInfo = actorsArr.filter(actor => actor.id == actorId);
  let success = actorInfo[0].known_for;
  let actorName = actorInfo[0].name;
  let pHeaderMedia = document.querySelector('.header-media p');
  pHeaderMedia.textContent = `${actorName} is well known for:`;
  displayCards(success, 'media');  
}

/** The displayCards is responsible for displaying actors or media */

function displayCards(arr, cardType){
  if(arr.length > 0){ 
    let imgPathType;
    let imgSize;
    
    let df = document.createDocumentFragment();
    arr.forEach(item => {
        if(cardType == 'actor'){
          imgPathType = item.profile_path;
          imgSize = profileSize;
        }
        else {
            imgPathType = item.poster_path;
            imgSize = posterSize;
        }  
        if(imgPathType !== null){ 
          
          let imgPath = secureBaseUrl+imgSize+imgPathType;
          let card = document.createElement('div');
          card.classList.add('card');
          card.setAttribute('id', item.id);
          
          if(cardType == 'actor'){
             /** Adding an event listener to each actor */
            card.addEventListener('click', actorDetails); 
          }         

          let imgWrap = document.createElement('div');
          imgWrap.classList.add('img-wrap');

          let img = document.createElement('img');
          img.setAttribute('src', imgPath);

          let h2 = document.createElement('h2');
          let p = document.createElement('p');

          let h3 = document.createElement('h3');

          if(cardType == 'actor'){
            img.setAttribute('alt', `Image of the actor ${item.name}`);
            h2.textContent = item.name;
            h3.textContent = 'Popularity: '+ item.popularity;
            p.innerHTML = addEmoji(item.popularity);
          }else if(item.media_type == 'movie'){
              h2.textContent = item.original_title;
              p.textContent = item.release_date.substring(0, 4);
              img.setAttribute('alt', `Poster of the movie ${item.original_title}`);              
            }else {
                h2.textContent = item.original_name;
                p.textContent = item.first_air_date.substring(0, 4);
                img.setAttribute('alt', `Poster of the TV show ${item.original_name}`);
            }         
            imgWrap.appendChild(img);
            let cardText = document.createElement('div');
            cardText.classList.add('card-text');         

            cardText.append(h2, h3, p);

            card.append(imgWrap, cardText);
            
            df.appendChild(card);
        }     

    })
          if(cardType == 'actor'){
            cards.textContent = '';
            cards.appendChild(df);
            activateSection('#actors');
          }else{
            cardsMedia.textContent = '';
            cardsMedia.appendChild(df);
            activateSection('#media');
          }   
  }
  else{
    alert('We have no movies or series for this actor');
  }
}

/** This is for when we need to go back to the actors page */
function goBack(ev){
  ev.preventDefault();
  history.back();
}

/** This is for adding the emoji. I made up a convention to display 2, 3, 4 or 5 stars */
function addEmoji(popularity){
  let star;
  if(popularity < 6.000){star = 2;}
  else if(popularity > 5.000 && popularity < 10.000){star = 3;}
        else if(popularity > 10.000 && popularity < 20.000){star = 4;}
              else if (popularity > 20.000){star = 5;}
          /** I have a feeling that I could use a switch statement */
          let emojis = '';
          for(let i=1; i<=star; i++){
            emojis += '<span> &#11088 </span> ';
          }

  return emojis;
}

/** We use popFunction() to handle the popstate event when the user navigates 
 * (back and forward in the browser) 
 * in the app.
 * */
function popFunction(ev){
  let hash = location.hash;
  if(history.state){
    let hs = JSON.stringify(history.state);
    let data = JSON.parse(hs);
    /** Making sure that the current actor in the url (even after several back and forth) 
     * is in the global array. I will grab the values from localstorage. 
     * */
      // let currentActor = hash.substring(hash.indexOf('#') + 1, hash.lastIndexOf('/') );
      let currentActor = hash.substring(1, hash.lastIndexOf('/') );
      let stringFromLS = localStorage.getItem(currentActor);
      let currActorsFromLS = JSON.parse(stringFromLS);
      actorsArr = currActorsFromLS;
    /** end */
    return media(data.actor);
  }else
      if(hash){   
        let param = hash.replace('#', '');
        queryActor = param;
        let urlActor =` https://api.themoviedb.org/3/search/person?api_key=${APIKEY}&query=${param}`;
        getActors(queryActor); 
      }else{
        activateSection('#instructions');
      }   
}

/** Sorting the actors by name and popularity*/
let order = true; // This is a global variable.

function sortByName(ev){
  ev.preventDefault();
  if(order){
    ascendant(actorsArr, 'name');
    displayCards(actorsArr, 'actor');
  }else{
    descendant(actorsArr, 'name');
    displayCards(actorsArr, 'actor');
  }
  order = !order;
}

function sortByPopularity(ev){
  ev.preventDefault();
  if(order){
    ascendant(actorsArr, 'popularity');
    displayCards(actorsArr, 'actor');
  }else{
    descendant(actorsArr, 'popularity');
    displayCards(actorsArr, 'actor');
  }
  order = !order;    
}

function ascendant(arr, sortingChoice){
  if(sortingChoice === 'name'){
      arr.sort((a,b) => {
        let x = a[sortingChoice].toLowerCase();
        let y = b[sortingChoice].toLowerCase();      
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }      
        return 0;       
      })
  }else if(sortingChoice === 'popularity'){
    arr.sort((a,b) => a[sortingChoice] - b[sortingChoice]);
  }  
}

function descendant(arr, sortingChoice){
  if(sortingChoice === 'name'){
    arr.sort((a,b) => {
      let x = a[sortingChoice].toLowerCase();
      let y = b[sortingChoice].toLowerCase();      
      if (x < y) {
        return 1;
      }
      if (x > y) {
        return -1;
      }      
      return 0;       
    })
  }else if(sortingChoice === 'popularity'){
    arr.sort((a,b) => b[sortingChoice] - a[sortingChoice]);
  }
  
}

/** End sorting by name and popularity */

