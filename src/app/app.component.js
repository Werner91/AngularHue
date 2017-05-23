"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var MyHue = new huepi();
var AppComponent = (function () {
    function AppComponent() {
        this.name = 'Angular';
        this.ConnectToHueBridge(MyHue);
        this.groups = MyHue.Groups;
        //console.log(this.groups);
        for (var g in this.groups) {
            console.log(g);
        }
        //MyHue.GroupOff(0);
    }
    AppComponent.prototype.onLightSwitchOn = function () {
        MyHue.GroupOn(0);
        MyHue.GroupSetCT(0, 467);
        MyHue.GroupSetBrightness(0, 144);
        console.log("done on");
    };
    AppComponent.prototype.onLightSwitchOff = function () {
        MyHue.GroupOff(0);
        console.log("done off");
    };
    AppComponent.prototype.DemoBehaviour = function () {
        MyHue.GroupOff(0);
        console.log("done");
    };
    AppComponent.prototype.StatusHeartbeat = function (MyHue) {
        MyHue.BridgeGetData().then(function UpdateUI() {
            console.log('Bridge Name: ' + MyHue.BridgeName);
            console.log('Connected');
            //$('#HUEInfoBar').slideUp(1500);
            //$('#brightnessslider').val(MyHue.Lights[2].state.bri); // Get brightness of 2nd light for now...
            //$('#brightnessslider').slider('refresh');
            //DemoBehaviour();
        }, function BridgeGetDataFailed() {
            console.log('StatusHeartbeat BridgeGet Failed');
            setTimeout(function () {
                this.onPause(MyHue);
                this.onResume();
            }, 100);
        });
    };
    AppComponent.prototype.ConnectToHueBridge = function (MyHue) {
        if (!localStorage.MyHueBridgeIP) {
            console.log("Trying to discover HUE Bridge via Hue Portal");
            //Get brdige IP
            MyHue.PortalDiscoverLocalBridges().then(function BridgesDiscovered() {
                console.log("Bridge IP: " + MyHue.BridgeIP);
                //Get bridge Configuration
                MyHue.BridgeGetConfig().then(function BridgeConfigReceived() {
                    console.log("Brdige name: " + MyHue.BridgeName);
                    //Get Bridge Data
                    MyHue.BridgeGetData().then(function BridgeDataReceived() {
                        localStorage.MyHueBridgeIP = MyHue.BridgeIP; // Chaching Bridge IP
                        console.log("Received data from bridge");
                    }, function UnableToRetreiveBridgeData() {
                        console.log("Unable to receive bridge data, please press the connect button on the hue brdige ");
                        MyHue.BridgeCreateUser().then(function BridgeUserCreated() {
                            localStorage.MyHueBridgeIP = MyHue.BridgeIP; //Chache Bridge IP
                            console.log("Connected to the Bridge: " + MyHue.UserName);
                            return;
                        }, function UnableToCreateUseronBridge() {
                            console.log("Unable to create new User, please press the connect button on the hue bridge ");
                            return;
                        });
                    });
                }, function UnableToRetreiveBridgeConfig() {
                    console.log("Unable to receive bridge config, please press the connect button on the hue bridge ");
                    return;
                });
            }, function UnableToDiscoverLocalBridgesViaPortal() {
                console.log("Error discovering bridge IP, please press the connect button on the hue bridge ");
                return;
            });
        }
        else {
            console.log("Using chached Bridge IP");
            MyHue.BridgeIP = localStorage.MyHueBridgeIP;
            console.log("Cached Bridge IP: " + MyHue.BridgeIP);
            MyHue.BridgeGetConfig().then(function CachedBridgeConfigReceived() {
                console.log("Bridge Name: " + MyHue.BridgeName);
                MyHue.BridgeGetData().then(function ChachedBridgeDataReveiced() {
                    console.log("connected");
                }, function UnableToRetreiveCachedBridgeData() {
                    delete localStorage.MyHueBridgeIP; // not Whitelisted anymore
                    console.log("Unable to Retreive Cached Bridge Data");
                    return;
                });
            }, function UnableToRetreiveBridgeConfig() {
                delete localStorage.MyHueBridgeIP; //not found anymore
                console.log("Unable to receive chached bridge config");
            });
        }
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "\n    <h1>Hello {{name}}</h1>\n    <div>\n      <ul>\n        <li *ngFor=\"let group of groups\">\n          {{group}}\n        </li>\n      </ul>\n    </div>\n    <Button (click)=\"onLightSwitchOn()\">On</Button>\n    <Button (click)=\"onLightSwitchOff()\">Off</Button>",
    }),
    __metadata("design:paramtypes", [])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map