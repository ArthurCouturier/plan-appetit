import Capacitor

@objc(WatchBridgePlugin)
public class WatchBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WatchBridgePlugin"
    public let jsName = "WatchBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setCurrentRecipe", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearCurrentRecipe", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ping", returnType: CAPPluginReturnPromise),
    ]

    override public func load() {
        print("[WatchBridgePlugin] Plugin loaded and registered with Capacitor")
    }

    @objc func ping(_ call: CAPPluginCall) {
        print("[WatchBridgePlugin] ping called from JS")
        call.resolve(["ok": true])
    }

    @objc func setCurrentRecipe(_ call: CAPPluginCall) {
        print("[WatchBridgePlugin] setCurrentRecipe called from JS")

        guard let name = call.getString("name") else {
            print("[WatchBridgePlugin] ERROR: name missing")
            call.reject("name is required")
            return
        }
        guard let imageBase64 = call.getString("imageBase64") else {
            print("[WatchBridgePlugin] ERROR: imageBase64 missing")
            call.reject("imageBase64 is required")
            return
        }

        print("[WatchBridgePlugin] Forwarding to WatchBridge (name=\(name), image length=\(imageBase64.count))")
        WatchBridge.shared.sendCurrentRecipe(name: name, imageBase64: imageBase64)
        call.resolve()
    }

    @objc func clearCurrentRecipe(_ call: CAPPluginCall) {
        print("[WatchBridgePlugin] clearCurrentRecipe called from JS")
        WatchBridge.shared.clearCurrentRecipe()
        call.resolve()
    }
}
