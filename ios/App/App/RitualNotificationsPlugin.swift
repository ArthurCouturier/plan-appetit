import Capacitor

@objc(RitualNotificationsPlugin)
public class RitualNotificationsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RitualNotificationsPlugin"
    public let jsName = "RitualNotifications"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "ping", returnType: CAPPluginReturnPromise),
    ]

    public static var shared: RitualNotificationsPlugin?

    override public func load() {
        Self.shared = self
        print("[RitualNotificationsPlugin] loaded and ready")
    }

    @objc func ping(_ call: CAPPluginCall) {
        call.resolve(["ok": true])
    }

    func emitQuickReply(mealType: String, text: String) {
        notifyListeners("ritualQuickReply", data: [
            "mealType": mealType,
            "text": text,
        ])
    }
}
