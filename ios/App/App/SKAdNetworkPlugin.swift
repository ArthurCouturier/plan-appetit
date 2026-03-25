import Capacitor
import StoreKit
import TikTokBusinessSDK

@objc(SKAdNetworkPlugin)
public class SKAdNetworkPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SKAdNetworkPlugin"
    public let jsName = "SKAdNetwork"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updateConversionValue", returnType: CAPPluginReturnPromise),
    ]

    @objc func updateConversionValue(_ call: CAPPluginCall) {
        let value = call.getInt("value") ?? 0

        print("[SKAdNetwork] Updating conversion value to \(value)")

        if #available(iOS 15.4, *) {
            SKAdNetwork.updatePostbackConversionValue(value) { error in
                if let error = error {
                    print("[SKAdNetwork] Error updating conversion value: \(error.localizedDescription)")
                } else {
                    print("[SKAdNetwork] Conversion value updated to \(value)")
                }
            }
        } else if #available(iOS 14.0, *) {
            SKAdNetwork.registerAppForAdNetworkAttribution()
            SKAdNetwork.updateConversionValue(value)
            print("[SKAdNetwork] Conversion value updated to \(value) (legacy API)")
        }

        call.resolve(["value": value])
    }
}
