import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

declare var huepi:any;
declare var jQuery:any;

var MyHue:any = new huepi();

@Component({
  selector: 'my-app',
  template: `
    <h1>Hello {{name}}</h1>
    <div>
      <ul>
        <li *ngFor="let group of lightgroups">
          {{group}}
        </li>
      </ul>
    </div>
    <Button (click)="onLightSwitchOn()">On</Button>
    <Button (click)="onLightSwitchOff()">Off</Button>
    <Button (click)="listAllGroups()"> Get Groups</Button>`,
})
  export class AppComponent implements OnInit {
    name = 'Angular';
    HeartbeatInterval:any;
    lightgroups:any[];
    ConnectToHueBridgeError:string;

    constructor(){
      this.lightgroups = [];
    }

    ngOnInit(){
      this.ConnectToHueBridge(MyHue)
        .then(() => this.listAllGroups())
        .catch(error => {
          this.ConnectToHueBridgeError = error;
          console.log(this.ConnectToHueBridgeError);
        });
    }

    ConnectToHueBridge(MyHue:any){
      return new Promise((resolve, reject) => {
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
                resolve();
              }, function UnableToRetreiveBridgeData(){
                MyHue.BridgeCreateUser().then(function BridgeUserCreated(){
                  (localStorage as any).MyHueBridgeIP = MyHue.BridgeIP; //Chache Bridge IP
                  reject("Unable to receive bridge data, please press the connect button on the hue brdige ")
                }, function UnableToCreateUseronBridge() {
                  reject("Unable to create new User, please press the connect button on the hue bridge ");
                });
              });
            }, function UnableToRetreiveBridgeConfig() {
                reject("Unable to receive bridge config, please press the connect button on the hue bridge ");
            });
          }, function UnableToDiscoverLocalBridgesViaPortal(){
              reject("Error discovering bridge IP, please press the connect button on the hue bridge ");
          });
        }else{// Using chached Bridge IP
          console.log("Using chached Bridge IP");
          MyHue.BridgeIP = (localStorage as any).MyHueBridgeIP;
          console.log("Cached Bridge IP: " + MyHue.BridgeIP);
          MyHue.BridgeGetConfig().then(function CachedBridgeConfigReceived(){
            console.log("Bridge Name: " + MyHue.BridgeName);
            MyHue.BridgeGetData().then(function ChachedBridgeDataReveiced(){
              console.log("connected");
              resolve();
            }, function UnableToRetreiveCachedBridgeData(){
                delete (localStorage as any).MyHueBridgeIP // not Whitelisted anymore
                reject("Unable to Retreive Cached Bridge Data");
            });
          }, function UnableToRetreiveBridgeConfig(){
              delete (localStorage as any).MyHueBridgeIP; //not found anymore
              reject("Unable to receive chached bridge config");
          });
        }
      });
    }

    listAllGroups(){
      console.log(MyHue.Groups);
      for(var g in MyHue.Groups){
        console.log(g);
        console.log(MyHue.Groups[g].name);
        this.lightgroups.push(g);
      }
      console.log("done loading groups");
    }

    onLightSwitchOn() {
      MyHue.GroupOn(this.lightgroups[4]);
      MyHue.GroupSetCT(0, 467);
      MyHue.GroupSetBrightness(0, 144);
      console.log("done on");
    }

    onLightSwitchOff() {
      MyHue.GroupOff(this.lightgroups[4]);
      console.log("done off");
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
}
