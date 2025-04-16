import Component from "@glimmer/component";
import { computed, action } from '@ember/object';
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { bind } from "discourse/lib/decorators";
import { ajax } from "discourse/lib/ajax";
import { Promise } from "rsvp";



export default class SubscriptionBar extends Component {
    //@tracked isMobile = false;
    @service router;
    @service appEvents;

    @tracked isLoading ;
    @tracked show = false;
    @tracked currentCategoryId;
    @tracked subcategories;
    @tracked letterIndexes = [];
    @tracked letterFilter = "";
    @tracked parentSlug;
    @tracked wordFilter = "";
    @tracked tmpWordFilter = "";
    @tracked currentPage = 1;
    @tracked totalPage = 1;
    @tracked noFilter = true;
    @tracked filterData;

  

  

    constructor() {
      super(...arguments);
      this.appEvents.on("page:changed", this, this._getSubcategory);
    }

    @bind
    currentCategory() {
      this.currentCategoryId = this.router.currentRoute?.attributes?.category?.id;
      return this.router.currentRoute?.attributes?.category?.id;
    }

    @bind
    configuredCategory() {
      if (settings.categoryIds.length) {
        return settings.categoryIds.includes(this.currentCategory());
      }else{
        return false
      }
    }

    

    @computed
    get isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    }

    isCurrentPage (cp, p) {
      return  cp == p
    }
    
    isLetterFilter(s) {
      if(s !== ""){
        const firstChar = s.toUpperCase().charAt(0);
        const r = firstChar === this.letterFilter || (this.letterFilter === "0-9" && firstChar >= '0' && firstChar <= '9')
        return r
      }
      return false;
      
    }

    isWordFilter(s) {
      if(s !== "") {
        const r = s.indexOf(this.wordFilter , 0) ===0 ;
        return r
      }

      return false;
      
    }

    getTotalFilters() {
      /*if(this.letterFilter !== "") {

        return subcategories.filter(x => context.isLetterFilter(x, context.letterFilter)).length;
      }
      if(this.wordFilter !== "") {
        return subcategories.filter(x => context.isWordFilter(x, context.wordFilter)).length;
      }*/
      return 20;
    }

    _filterData() {
      let results;
      if(this.noFilter){
        results = this.subcategories;
      }else if(this.letterFilter !== "") {
        results = this.subcategories.filter(x => this.isLetterFilter(x.name));
      }else if(this.wordFilter !== "") {
        results = this.subcategories.filter(x => this.isWordFilter(x.name));
      }
      console.log(results);
      this.filterData = [...results];
    }

    _getSubcategory() {
      this.currentCategoryId = 0;
      

      if (this.configuredCategory()) {
        this.isLoading = true;
        this.show = true;

        let results = ajax(`/categories.json?include_subcategories=true`).then((result) => {
          let arr = []
          const cat = result.category_list.categories.filter((c) => c.id === this.currentCategoryId);
          if(cat.length > 0){
            this.parentSlug = cat[0].slug;
            this.subcategories = cat[0].subcategory_list;
          }else{
            this.subcategories = [];
          }
          
          this.subcategories.forEach((c) => {
            let firstLetter = c.name.toUpperCase().charAt(0);
            if(/^[0-9]$/.test(firstLetter)){
              firstLetter = "0-9"
            }
            
            const p = arr.filter(x => x === firstLetter);
            
            if(p.length == 0 ) {
              //console.log("Add " + firstLetter)
              arr.push(firstLetter)
            }
          })
          //console.log(this.letterIndexes);

          arr.sort();
          
          return arr;
        })

        Promise.all([results]).then((r) => {
          //console.log(r[0]);

          this.letterIndexes = r[0];
          this.isLoading = false;
        });


        /*this.galleryOnly = this.configuredCategory().galleryOnly;
  
        let id = parseInt(this.configuredCategory().topic, 10);
  
        let topicContent = ajax(`/t/${id}.json`).then((result) => {
          this.topicId = result.id;
          return result.post_stream.posts[0].cooked;
        });
        Promise.all([topicContent]).then((result) => {
          let htmlWrapper = document.createElement("div");
          htmlWrapper.innerHTML = result[0];
  
          let imageList = htmlWrapper.querySelectorAll("img");
  
          this.topicContent = imageList;
          
          scrollTop();
        });*/
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.show = false;
        this.wordFilter = "";
        this.letterFilter = "";
        this.currentPage = 1;
        this.totalPage = 1;
        this.tmpWordFilter = "";
        this.noFilter = true;

      }
    }
  
    @action
    filterLetter(letter) {
        //alert("Letter is " + letter);
        this.letterFilter = letter;
        this.wordFilter = "";
        this.noFilter = false;
        this._filterData();
    }

    @action
    setNoFilter() {
      this.noFilter = true;
      this.letterFilter = "";
      this.wordFilter = "";
      this._filterData();
    }

    @action
    goToPage(p) {
      this.currentPage = p;
    }

    @action
    goSubcategory(slug) {
      const url = "/c/" + this.parentSlug + "/" + slug
      //alert("go " + url);
      window.location.href = url;
    }

    @action
    submitFilter() {
      //alert(`Input search: ${this.wordFilter}`);
      this.letterFilter = "";
      this.wordFilter = this.tmpWordFilter;
      this.noFilter = false;
    }

    @action
    handleInputFilter(event) {
      this.tmpWordFilter = event.target.value;
    }

  

    async fetchUserSubscription() {
        try {

          const buttonText = document.getElementById("subscription-bar__button_text");
          buttonText.innerHTML = "Checking...";

          let username = '';
          let email = '';
          // Fetch current user name
          const response1 = await fetch(`/session/current.json`);
          const data1 = await response1.json();
          username = data1.current_user.username
        
          
          
          //alert('Username:' +  username)

      
          // Fetch email
          const response2 = await fetch(`/u/${data1.current_user.username}/emails.json`);
          const data2 = await response2.json();
          //console.log('Second fetch result:', data2);
          email = data2.email;
          //alert('Email:' +  email)

          //alert(settings.url_generate_token);
      
          // Third fetch
          const response3 = await fetch(settings.url_generate_token, 
            { 
              method: "POST",
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({
                  username: username,   // Replace with the actual data you want to send
                  email: email
              }) }
          );
          const data3 = await response3.json();
          //console.log(data3);
          let token = data3.token;
          buttonText.innerHTML = "Subscribe";
          //alert(token);
          try{
            if(this.isMobile){
              window.location.href = settings.url_subscription + "?token=" + token;
            }else{
              window.open(settings.url_subscription + "?token=" + token,"_blank");
            }
          }catch (e) {
            alert(error);
          }
          
          
          //console.log('Third fetch result:', data3);
        } catch (error) {
          console.error('Error during fetch:', error);
        }
      }
}