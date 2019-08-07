export class Thing {
    id :number;
    alias :string;
    address :string ;
    commTech :string ;
    productHash : string;
    manufacturerId : string;
    productId : string ; 
    productName : string;
    deviceId :string ;
    hwVersion :string ;
    swVersion :string ;
    powerSource : string;
    wakeupInterval : string;
    locationId:number;
    locationAlias:string;
    services:Service[]=[];
    category:string;
    propertySets : Map<string,Map<string,any>>;
    techSpecificProps : Map<string,string>;

}

export class Service {
    id : number;
    name : string;
    alias : string;
    address : string ;
    groups : string[];
    locationId : string ;
    locationAlias : string ;
    props : Map<string,any>;
    propSetRef : string;
    interfaces : Interface[]=[];

}

export class Interface {
    type :string ;
    msgType : string ;
    valueType : string ;
    lastValue : any ;
    version : string ;
}

export class ServiceInterface {
    thingId: number;
    thingAddress: string; "33" 
    thingTech: string; "zw"
    thingAlias: string;
    serviceId: number;
    serviceName: string; //"battery"
    serviceAlias: string; //
    serviceAddress: string; // "/rt:dev/rn:zw/ad:1/sv:battery/ad:33_0"
    intfType: string; // "out"
    intfMsgType: string; // "evt.alarm.report"
    intfValueType :string;//
    intfAddress: string; //"pt:j1/mt:evt/rt:dev/rn:zw/ad:1/sv:sensor_temp/ad:33_0",
    locationId: number;
    locationAlias:string;
    locationType:string;
    groups: string[];
}

export class Location {
    id:number;
    type:string;
    alias:string;
    address:string;
    long:number;
    lat:number;
}
