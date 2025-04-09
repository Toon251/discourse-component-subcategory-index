import Component from "@glimmer/component";
import { computed, action } from '@ember/object';
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { bind } from "discourse/lib/decorators";
import { ajax } from "discourse/lib/ajax";



export default class SubscriptionBar extends Component {
    //@tracked isMobile = false;
    @service router;
    @service appEvents;

    @tracked isLoading;
    @tracked show = false;
    @tracked currentCategoryId;
    @tracked subcategories;

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
      }
    }

    @computed
    get isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    }

    _getSubcategory() {
      if (this.currentCategory() && this.configuredCategory()) {
        this.isLoading = true;
        this.show = true;

        ajax(`/categories.json?include_subcategories=true`).then((result) => {
          const cat = result.category_list.categories.filter((c) => c.id === this.currentCategoryId);
          this.subcategories = cat.subcategory_list;
          console.log(cat)
          //return cat.subcategory_list;
        })

        



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
        this.showFor = false;
      }
    }
  
    @action
    handleClick() {
        this.fetchUserSubscription();

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