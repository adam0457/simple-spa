/**
 * Student: Vladymir Adam
 * Final Assignment: Advanced SPA
 * mad9014 - 2021 
 */


'use strict';

const APP = {
  /** My global variables */
  queryActor: '',
  actorsArr : [],
  secureBaseUrl: '',
  logoSize: '',
  posterSize: '',
  profileSize: '',
  APIKEY : '75789c3f5ba1cec6147292baa65a1ecc',
  cards : document.querySelector('.cards'),
  cardsMedia : document.querySelector('.cards-media'),
  inputName : document.querySelector('#search'),
  back : document.querySelector('.btn-back'),
  nameElement : document.querySelector('.name'),
  popularityElement : document.querySelector('.popularity'),
  //  urlConfig : `https://api.themoviedb.org/3/configuration?api_key=${APP.APIKEY}`,
  urlConfig : `https://api.themoviedb.org/3/configuration?api_key=75789c3f5ba1cec6147292baa65a1ecc`,

  /** This will initialize the app  */
  init: function(){
        /** Those are some events that we will need to handle navigation and sorting by name and popularity */
        window.addEventListener('popstate', NAVIGATE.popFunction);
        APP.back.addEventListener('click', NAVIGATE.goBack);  // This is for the back button which is an anchor tag.
        APP.nameElement.addEventListener('click', SORTING.byName);
        APP.popularityElement.addEventListener('click', SORTING.byPopularity);

        /** We're making the instruction page the default page */
        APP.activateSection('#instructions');

        /** This is for when we need to go back to the home page */
        let h1 = document.querySelector('h1');
        h1.addEventListener('click', (ev) => {APP.activateSection('#instructions');})

        /** Clicking on the search button or pressing enter from the input text will run the search function  */
        let btnSearch = document.querySelector('#btnSearch');
        btnSearch.addEventListener('click', SEARCHING.search);
        APP.inputName.addEventListener('keydown', (ev) => {
          if(ev.key === 'Enter'){
            ev.preventDefault();
            SEARCHING.search(ev);
          }
        });
        
        /** The function getConfig() will fetch the configuration infos from the api once the page is loaded 
         * and put some of them in global variables 
         * */
        APP.getConfig();
  },

 

  getConfig: () => {
          fetch(APP.urlConfig)
          .then(response => {
            return response.json();
          })
          .then(data => {
            /** I need those info from the configuration fetch to display the images later on */
              APP.secureBaseUrl = data.images.secure_base_url;
              APP.logoSize = data.images.logo_sizes[6];
              APP.posterSize = data.images.poster_sizes[2];
              APP.profileSize = data.images.profile_sizes[1];
          })
          .catch(err => {
            alert(err);
          })
          
  },

  activateSection: (sectionId) => {
    let sectionToActivate = document.querySelector(sectionId);
    let otherSectionActive = document.querySelectorAll('.active');
    if(otherSectionActive.length > 0){
      otherSectionActive.forEach(sect => {
        sect.classList.remove('active');
      })
    }
    sectionToActivate.classList.add('active');
  }
};

/** With the SEARCHING object we search for actors, if we have them in the localStorage we grab 
 * them from there with getActors() if not we fetch them from the api with fetchActor().
 * 
 */
const SEARCHING = {
    search: (ev) => {
          ev.preventDefault();
          APP.queryActor = APP.inputName.value;
          if(APP.queryActor !== ''){
            SEARCHING.getActors(APP.queryActor);
            history.pushState(null,' ', `#${APP.queryActor}`);
          }
          else {alert('You did not enter any name')}
        
          APP.inputName.value = '';  
    },

    getActors: (searchString) => {
              let stringData = localStorage.getItem(searchString);
              if(stringData){
                  let dataFromLocaleStorage = JSON.parse(stringData);
                  APP.actorsArr = dataFromLocaleStorage;
                  DISPLAY.displayCards(APP.actorsArr, 'actor');
              }else{
                    let urlActor =` https://api.themoviedb.org/3/search/person?api_key=${APP.APIKEY}&query=${searchString}`;
                    SEARCHING.fetchActor(urlActor);
                }
    },

    fetchActor: (url) => {
              fetch(url)
              .then(response => {
                return response.json();
              }).then(data => {
                APP.actorsArr = data.results;
                localStorage.setItem(APP.queryActor, JSON.stringify(APP.actorsArr));
                /** The function fetchActor is using the displayCards function to display the info of 
                 * the actors(photo, name and a number of stars emoji based on his popularity)
                 * 
                 */
                DISPLAY.displayCards(APP.actorsArr, 'actor');
                
              }).catch(err => {
                alert(err);
              })
    }
};

/** The object DISPLAY is responsible for displaying actors or media using the functions
 *  actorDetails(), media() and  displayCards().
 * actorDetails() gets the actor the user has clicked on;
 * media() filters the global array of actors to get only infos of this specific actor;
 * displayCards() display the results.
 */

const DISPLAY = {
    actorDetails: (ev) => {let actorClicked = ev.currentTarget;   
            let id = actorClicked.getAttribute('id');
            DISPLAY.media(id);
            let hash = location.hash;
            history.pushState({'actor': id}, '', `${hash}/${id}`)
          },

    media: (actor) => {
      let actorId = actor;
      let actorInfo = APP.actorsArr.filter(actor => actor.id == actorId);
      let success = actorInfo[0].known_for;
      let actorName = actorInfo[0].name;
      let pHeaderMedia = document.querySelector('.header-media p');
      pHeaderMedia.textContent = `${actorName} is well known for:`;
      DISPLAY.displayCards(success, 'media');  
    },

    displayCards: (arr, cardType) => {
      if(arr.length > 0){ 
        let imgPathType;
        let imgSize;
        
        let df = document.createDocumentFragment();
        arr.forEach(item => {
            if(cardType == 'actor'){
              imgPathType = item.profile_path;
              imgSize = APP.profileSize;
            }
            else {
                imgPathType = item.poster_path;
                imgSize = APP.posterSize;
            }  
            if(imgPathType !== null){ 
              
              let imgPath = APP.secureBaseUrl+imgSize+imgPathType; 
              let card = document.createElement('div');
              card.classList.add('card');
              card.setAttribute('id', item.id);
              
              if(cardType == 'actor'){
                 /** Adding an event listener to each actor */
                card.addEventListener('click', DISPLAY.actorDetails); 
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
                p.innerHTML = DISPLAY.addEmoji(item.popularity);
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
                APP.cards.textContent = '';
                APP.cards.appendChild(df);
                APP.activateSection('#actors');
              }else{
                APP.cardsMedia.textContent = '';
                APP.cardsMedia.appendChild(df);
                APP.activateSection('#media');
              }   
      }
      else{
        alert('We have no movies or series for this actor');
      }
    },
    addEmoji: (popularity) => {
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
};

/** NAVIGATE handles the navigation within the application whether with the back button (the anchor tag)
 *  or the arrows (back and forward in the browser). It uses the goBack() for the button and 
 * the popFunction() for the back and forward. 
 * */

const NAVIGATE = {
    goBack: (ev) => {
      ev.preventDefault();
      history.back();
    },

    popFunction: (ev) => {
              let hash = location.hash;
              if(history.state){
                let hs = JSON.stringify(history.state);
                let data = JSON.parse(hs);
                /** Making sure that the current actor in the url (even after several back and forth) 
                 * is in the global array. I will grab the values from localstorage. 
                 * */                
                  let currentActor = hash.substring(1, hash.lastIndexOf('/') );
                  let stringFromLS = localStorage.getItem(currentActor);
                  let currActorsFromLS = JSON.parse(stringFromLS);
                  APP.actorsArr = currActorsFromLS;
                /** end */
                return DISPLAY.media(data.actor);
              }else
                  if(hash){   
                    let param = hash.replace('#', '');
                    APP.queryActor = param;
                    let urlActor =` https://api.themoviedb.org/3/search/person?api_key=${APP.APIKEY}&query=${param}`;
                    SEARCHING.getActors(APP.queryActor); 
                  }else{
                    APP.activateSection('#instructions');
                  }   
                }
};

/** Sorting the actors by name and popularity */

const SORTING = {
  order: true,
  byName: (ev) =>{
              ev.preventDefault();
              if(SORTING.order){
                SORTING.ascendant(APP.actorsArr, 'name');
                DISPLAY.displayCards(APP.actorsArr, 'actor');
              }else{
                SORTING.descendant(APP.actorsArr, 'name');
                DISPLAY.displayCards(APP.actorsArr, 'actor');
              }
              SORTING.order = !SORTING.order;
  },
  byPopularity: (ev) => {
              ev.preventDefault();
              if(SORTING.order){
                SORTING.ascendant(APP.actorsArr, 'popularity');
                DISPLAY.displayCards(APP.actorsArr, 'actor');
              }else{
                SORTING.descendant(APP.actorsArr, 'popularity');
                DISPLAY.displayCards(APP.actorsArr, 'actor');
              }
              SORTING.order = !SORTING.order;
  },
  ascendant: (arr, sortingChoice) => {
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
  },

  descendant: (arr, sortingChoice) => {
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
};


APP.init();