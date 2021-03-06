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
require("rxjs/add/observable/of");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
require("rxjs/add/operator/map");
require("rxjs/Rx");
var MyHue = new huepi();
var AppComponent = (function () {
    function AppComponent() {
        this.name = 'Angular';
        this.hueGroups = [];
        this.fullGroup = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.ConnectToHueBridge(MyHue)
            .then(function () { return _this.listAllGroups(); })
            .catch(function (error) {
            _this.ConnectToHueBridgeError = error;
            console.log(_this.ConnectToHueBridgeError);
        })
            .then(function () { return _this.createFullGroup(); });
    };
    AppComponent.prototype.createFullGroup = function () {
        this.fullGroup = this.hueGroups.map(function (group) {
            var lightElement = group.lights.map(function (lightID) {
                var fullLightObject = { fullLight_ID: "", fullLight_Name: "" };
                console.log("LightID:" + lightID);
                console.log("LightName:" + MyHue.Lights[lightID].name);
                fullLightObject.fullLight_ID = lightID;
                fullLightObject.fullLight_Name = MyHue.Lights[lightID].name;
                lightID = fullLightObject;
                return lightID;
            });
            group.lights = lightElement;
            return group;
        });
        console.log(this.fullGroup);
    };
    AppComponent.prototype.ConnectToHueBridge = function (MyHue) {
        return new Promise(function (resolve, reject) {
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
                            resolve();
                        }, function UnableToRetreiveBridgeData() {
                            MyHue.BridgeCreateUser().then(function BridgeUserCreated() {
                                localStorage.MyHueBridgeIP = MyHue.BridgeIP; //Chache Bridge IP
                                reject("Unable to receive bridge data, please press the connect button on the hue brdige ");
                            }, function UnableToCreateUseronBridge() {
                                reject("Unable to create new User, please press the connect button on the hue bridge ");
                            });
                        });
                    }, function UnableToRetreiveBridgeConfig() {
                        reject("Unable to receive bridge config, please press the connect button on the hue bridge ");
                    });
                }, function UnableToDiscoverLocalBridgesViaPortal() {
                    reject("Error discovering bridge IP, please press the connect button on the hue bridge ");
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
                        resolve();
                    }, function UnableToRetreiveCachedBridgeData() {
                        delete localStorage.MyHueBridgeIP; // not Whitelisted anymore
                        reject("Unable to Retreive Cached Bridge Data");
                    });
                }, function UnableToRetreiveBridgeConfig() {
                    delete localStorage.MyHueBridgeIP; //not found anymore
                    reject("Unable to receive chached bridge config");
                });
            }
        });
    };
    AppComponent.prototype.listAllGroups = function () {
        console.log("");
        console.log("---Groups---");
        for (var g in MyHue.Groups) {
            for (var id = 0; id < MyHue.Groups[g].lights.length; id++) {
                console.log("LightID:" + MyHue.Lights[MyHue.Groups[g].lights[id]].name); // Returns the name of the Lights
            }
            this.hueGroups.push(MyHue.Groups[g]);
        }
        console.log(this.hueGroups);
    };
    AppComponent.prototype.onLightSwitchOn = function () {
        MyHue.LightOn();
        //MyHue.GroupOn(this.hueGroups[0]);
        //MyHue.GroupSetCT(0, 467);
        //MyHue.GroupSetBrightness(0, 144);
        console.log("done on");
    };
    AppComponent.prototype.onLightSwitchOff = function () {
        MyHue.GroupOff(this.hueGroups[0]);
        console.log("done off");
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
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "\n    <h1>Hello {{name}}</h1>\n    <div>\n      <ul>\n        <li *ngFor=\"let group of fullGroup\">\n          {{group.name}}\n          <ul>\n            <li *ngFor=\"let light of group.lights\">\n            {{light.fullLight_ID}}\n            {{light.fullLight_Name}}\n            </li>\n          </ul>\n        </li>\n      </ul>\n    </div>\n    <Button (click)=\"onLightSwitchOn()\">On</Button>\n    <Button (click)=\"onLightSwitchOff()\">Off</Button>\n    <Button (click)=\"listAllGroups()\"> Get Groups</Button>",
    }),
    __metadata("design:paramtypes", [])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map