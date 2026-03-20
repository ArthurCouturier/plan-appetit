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
            call.reject("appId is required")
            return
        }

        DispatchQueue.main.async {
            let config = TikTokConfig(appId: appId)
            config?.setLogLevel(.suppress)
            TikTokBusiness.initializeSdk(config)
            call.resolve()
        }
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let eventName = call.getString("eventName") else {
            call.reject("eventName is required")
            return
        }

        let eventId = call.getString("eventId")
        let properties = call.getObject("properties")

        if let eventId = eventId {
            TikTokBusiness.trackEvent(eventName, withId: eventId)
        } else if let properties = properties {
            TikTokBusiness.trackEvent(eventName, withProperties: properties as [String: Any])
        } else {
            TikTokBusiness.trackEvent(eventName)
        }

        call.resolve()
    }
}
