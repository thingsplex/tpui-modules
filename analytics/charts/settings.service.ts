import { Injectable } from '@angular/core';
import {FimpService} from "app/fimp/fimp.service";
import {BehaviorSubject, Subject} from "rxjs";
import {Subscription} from "rxjs/Subscription";
import {HttpClient} from "@angular/common/http";
import {BACKEND_ROOT} from "../../../globals";

@Injectable()
export class AnalyticsSettingsService{
  globalSub : Subscription;
  colors = {};
  changeDetected = false;
  private registryStateSource = new BehaviorSubject<string>("");
  public registryState$ = this.registryStateSource.asObservable();

  constructor(private fimp: FimpService,private http: HttpClient) {
    this.load();
  }

  public init() {

  }

  getColor(label:string):string {
    let result = this.colors[label];
    let defaultColours = {
      "RUNNING":"#1ecc39",
      "LOADED":"#faf850",
      "STOPPED":"#e80823",
      "success":"#1ecc39",
      "failed":"#e80823",
      "battery":"#ef9e16",
      "ac":"#1ecc39",
      "zwave":"#1ecc39",
      "zigbee":"#19e0c2",
      "flow":"#ea9e07"
    }
    if(result == undefined) {
      let defColor = defaultColours[label]
      if (defColor)
        result = defColor;
      else
        result = this.randomRgba(0.9);
      this.colors[label] = result;
      this.changeDetected = true;
    }
    console.log(result);
    return result;
  }

  setColor(label:string,color:string) {
    this.colors[label] = color;
  }

  getAllColors():any {
    return this.colors;
  }

  randomRgba(a) {
    let o = Math.round, rd = Math.random, s = 255;
    // return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + a + ')';
    let red = o(rd()*s);
    let green = o(rd()*s);
    let blue = o(rd()*s);
    let r = (+red).toString(16)
    let g = (+green).toString(16)
    let b = (+blue).toString(16)

    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
    if (a.length == 1)
      a = "0" + a;

    return "#" + r + g + b;
  }

  save() {
    if (this.changeDetected)
      this.saveToLocalStorage();
  }
  load() {
    this.loadFromLocalStorage();
  }
  saveToLocalStorage() {
    localStorage.setItem("colorMap", JSON.stringify(this.colors));
    this.changeDetected = false;
  }

  loadFromLocalStorage():boolean {
    if (localStorage.getItem("colorMap")!=null){
      this.colors =  JSON.parse(localStorage.getItem("colorMap")) as Map<string,string>;
      return true;
    }
    return false;
  }

  saveToRemoteStorage() {
    let body = "adfa";
    this.http.post(BACKEND_ROOT+"/fimp/api/ui-settings",body)
      .subscribe(result=>{
        result = result["apps"];

      });
  }

  loadFromRemoteStorage() {
    this.http.get(BACKEND_ROOT+"/fimp/api/ui-settings")
      .subscribe(result=>{
        result = result["apps"];

      });
  }


}



