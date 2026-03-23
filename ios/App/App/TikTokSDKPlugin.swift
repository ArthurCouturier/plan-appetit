import Capacitor
import TikTokBusinessSDK

@objc(TikTokSDKPlugin)
public class TikTokSDKPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TikTokSDKPlugin"
    public let jsName = "TikTokSDK"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "trackEvent", returnType: CAPPluginReturnPromise),
    ]

    @objc func initialize(_ call: CAPPluginCall) {
        guard let appId = call.getString("appId") else {
            print("[TikTokSDK] ERROR: appId is required")
            call.reject("appId is required")
            return
        }

        print("[TikTokSDK] Initializing with appId: \(appId)")

        DispatchQueue.main.async {
            let config = TikTokConfig(appId: appId, tiktokAppId: appId)
            config?.setLogLevel(TikTokLogLevelDebug)
            config?.enableDebugMode()
            TikTokBusiness.initializeSdk(config)
            print("[TikTokSDK] SDK initialized successfully")
            call.resolve()
        }
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let eventName = call.getString("eventName") else {
            print("[TikTokSDK] ERROR: eventName is required")
            call.reject("eventName is required")
            return
        }

        let eventId = call.getString("eventId")
        let properties = call.getObject("properties")

        print("[TikTokSDK] Tracking event: \(eventName), eventId: \(eventId ?? "nil")")

        let event: TikTokBaseEvent
        if let eventId = eventId {
            event = TikTokBaseEvent(eventName: eventName, eventId: eventId)
        } else {
            event = TikTokBaseEvent(eventName: eventName)
        }

        if let properties = properties {
            for (key, value) in properties {
                event.addProperty(withKey: key, value: value)
            }
        }

        TikTokBusiness.trackTTEvent(event)
        call.resolve()
    }
}
