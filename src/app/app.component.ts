import { Component } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

declare var huepi:any;
declare var jQuery:any;

var MyHue = new huepi();

@Component({
  selector: 'my-app',
  template: `
    <h1>Hello {{name}}</h1>
    <div>
      <ul>
        <li *ngFor="let group of groups">
          {{group}}
        </li>
      </ul>
    </div>
    <Button (click)="onLightSwitchOn()">On</Button>
    <Button (click)="onLightSwitchOff()">Off</Button>`,
})
  export class AppComponent  {
    name = 'Angular';
    HeartbeatInterval:any;
    groups: string[];

    constructor(){
      this.ConnectToHueBridge(MyHue);
      this.groups = MyHue.Groups;
      //console.log(this.groups);
      for(var g in this.groups){
        console.log(g);
      }

      //MyHue.GroupOff(0);
    }

    onLightSwitchOn() {
      MyHue.GroupOn(0);
      MyHue.GroupSetCT(0, 467);
      MyHue.GroupSetBrightness(0, 144);
      console.log("done on");
    }

    onLightSwitchOff() {
      MyHue.GroupOff(0);
      console.log("done off");
    }

    DemoBehaviour() {
      MyHue.GroupOff(0);

      console.log("done");
    }


    StatusHeartbeat(MyHue:any) {
      MyHue.BridgeGetData().then(function UpdateUI() {
        console.log('Bridge Name: ' + MyHue.BridgeName);
        console.log('Connected');
        //$('#HUEInfoBar').slideUp(1500);

        //$('#brightnessslider').val(MyHue.Lights[2].state.bri); // Get brightness of 2nd light for now...
        //$('#brightnessslider').slider('refresh');
        //DemoBehaviour();
    }, function BridgeGetDataFailed() {
        console.log('StatusHeartbeat BridgeGet Failed');
        setTimeout(function() {
          this.onPause(MyHue);
          this.onResume();
        }, 100);
      });
    }

ConnectToHueBridge(MyHue:any){
  if(!(localStorage as any).MyHueBridgeIP){ // No chaced BridgeIP?
    console.log("Trying to discover HUE Bridge via Hue Portal")
    //Get brdige IP
    MyHue.PortalDiscoverLocalBridges().then(function BridgesDiscovered(){
      console.log("Bridge IP: " + MyHue.BridgeIP);
      //Get bridge Configuration
      MyHue.BridgeGetConfig().then(function BridgeConfigReceived(){
        console.log("Brdige name: " + MyHue.BridgeName);
        //Get Bridge Data
        MyHue.BridgeGetData().then(function BridgeDataReceived(){
          (localStorage as any).MyHueBridgeIP = MyHue.BridgeIP; // Chaching Bridge IP
          console.log("Received data from bridge");
        }, function UnableToRetreiveBridgeData(){
          console.log ("Unable to receive bridge data, please press the connect button on the hue brdige ");
          MyHue.BridgeCreateUser().then(function BridgeUserCreated(){
            (localStorage as any).MyHueBridgeIP = MyHue.BridgeIP; //Chache Bridge IP
            console.log("Connected to the Bridge: " + MyHue.UserName);
            return;
          }, function UnableToCreateUseronBridge() {
            console.log("Unable to create new User, please press the connect button on the hue bridge ");
            return;
          });
        });
      }, function UnableToRetreiveBridgeConfig() {
          console.log ("Unable to receive bridge config, please press the connect button on the hue bridge ");
          return;
      });
    }, function UnableToDiscoverLocalBridgesViaPortal(){
        console.log("Error discovering bridge IP, please press the connect button on the hue bridge ");
        return;
    });
  }else{// Using chached Bridge IP
    console.log("Using chached Bridge IP");
    MyHue.BridgeIP = (localStorage as any).MyHueBridgeIP;
    console.log("Cached Bridge IP: " + MyHue.BridgeIP);
    MyHue.BridgeGetConfig().then(function CachedBridgeConfigReceived(){
      console.log("Bridge Name: " + MyHue.BridgeName);
      MyHue.BridgeGetData().then(function ChachedBridgeDataReveiced(){
        console.log("connected");
      }, function UnableToRetreiveCachedBridgeData(){
          delete (localStorage as any).MyHueBridgeIP // not Whitelisted anymore
          console.log("Unable to Retreive Cached Bridge Data");
          return;
      });
    }, function UnableToRetreiveBridgeConfig(){
        delete (localStorage as any).MyHueBridgeIP; //not found anymore
        console.log("Unable to receive chached bridge config");
    });
  }
}



/*
  //Checks if there is a Hue bridge in the network
  discoverLocalBridge(hue:any){
    let bridgeIP:string;
    hue.discover().then((bridges:any) => {
      if(bridges.length === 0) {
          console.log('No bridges found. :(');
      }
      else {
          (bridges.forEach((b:any) => {
            console.log('Bridge found at IP address ' + b.internalipaddress);
            bridgeIP = b.internalipaddress;
          }));
          //ToDo: What happens if there als multiple Briges

          this.createNewUser(hue, bridgeIP);
      }
    }).catch((e:any) => console.log('Error finding bridges', e));
  }

  createNewUser(hue:any, bridgeIP:string){

    var bridge = hue.bridge(bridgeIP);
    // create user account (requires link button to be pressed)
    bridge.createUser('myApp#testdevice').then((data:any) => {
      // extract bridge-generated username from returned data
      var username = data[0].success.username;

      console.log('New username:', username);

      // instantiate user object with username
      var user = bridge.user(username);
    }).catch((e:any) => console.log("There was an error by creating a new user", e));
  }
  */

}
