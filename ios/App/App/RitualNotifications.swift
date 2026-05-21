import Foundation
import UserNotifications

@objc public class RitualNotifications: NSObject, UNUserNotificationCenterDelegate {
    @objc public static let shared = RitualNotifications()

    public static let CATEGORY_ID = "RITUAL_DAILY"
    public static let ACTION_REPLY = "RITUAL_QUICK_REPLY"

    private var originalDelegate: UNUserNotificationCenterDelegate?

    @objc public func activate() {
        registerCategory()
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.wrapDelegate()
        }
    }

    private func registerCategory() {
        let replyAction = UNTextInputNotificationAction(
            identifier: Self.ACTION_REPLY,
            title: "Répondre",
            options: [],
            textInputButtonTitle: "Envoyer",
            textInputPlaceholder: "Décris nous rapidement ton repas"
        )
        let category = UNNotificationCategory(
            identifier: Self.CATEGORY_ID,
            actions: [replyAction],
            intentIdentifiers: [],
            options: []
        )
        let center = UNUserNotificationCenter.current()
        center.getNotificationCategories { existing in
            var updated = existing
            updated = updated.filter { $0.identifier != Self.CATEGORY_ID }
            updated.insert(category)
            center.setNotificationCategories(updated)
            print("[RitualNotifications] category \(Self.CATEGORY_ID) registered")
        }
    }

    private func wrapDelegate() {
        let center = UNUserNotificationCenter.current()
        if center.delegate === self { return }
        if let existing = center.delegate, existing !== self {
            self.originalDelegate = existing
        }
        center.delegate = self
        print("[RitualNotifications] delegate wrapped (had original: \(self.originalDelegate != nil))")
    }

    public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        if response.actionIdentifier == Self.ACTION_REPLY,
           let textResponse = response as? UNTextInputNotificationResponse {
            let userInfo = response.notification.request.content.userInfo
            let mealType = (userInfo["mealType"] as? String) ?? "UNSPECIFIED"
            let text = textResponse.userText
            print("[RitualNotifications] quick-reply received mealType=\(mealType) length=\(text.count)")
            RitualNotificationsPlugin.shared?.emitQuickReply(mealType: mealType, text: text)
            completionHandler()
            return
        }
        if let original = originalDelegate,
           original.responds(to: #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:withCompletionHandler:))) {
            original.userNotificationCenter?(center, didReceive: response, withCompletionHandler: completionHandler)
        } else {
            completionHandler()
        }
    }

    public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if let original = originalDelegate,
           original.responds(to: #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:willPresent:withCompletionHandler:))) {
            original.userNotificationCenter?(center, willPresent: notification, withCompletionHandler: completionHandler)
        } else {
            completionHandler([.banner, .sound, .badge])
        }
    }

    public func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        openSettingsFor notification: UNNotification?
    ) {
        if let original = originalDelegate,
           original.responds(to: #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:openSettingsFor:))) {
            original.userNotificationCenter?(center, openSettingsFor: notification)
        }
    }
}
