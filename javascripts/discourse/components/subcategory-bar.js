import Component from "@glimmer/component";
import { computed, action } from '@ember/object';
import Service from '@ember/service';

export default class SubscriptionBar extends Component {
    //@tracked isMobile = false;

    @computed
    get isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    }
  
    @action
    handleClick() {
        this.fetchUserSubscription();

    }

    didInsertElement() {
        this._super(...arguments);
        console.log("disInsertElement");

        // Access the current route and check if it's a category route
        const currentRoute = this.router.currentRouteName;

        if (currentRoute.startsWith('category.')) {
            // Get the category controller
            const categoryController = this.get('categoryController');

            // Retrieve the current category ID
            const categoryId = categoryController.get('model.id');

            // Log the category ID to the console
            console.log('Current Category ID:', categoryId);

            // Optionally, you can use the categoryId for further logic
        }
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