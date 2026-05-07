import Foundation
import WatchConnectivity
import UIKit

final class WatchBridge: NSObject, WCSessionDelegate, @unchecked Sendable {
    static let shared = WatchBridge()

    private override init() {
        super.init()
    }

    func activate() {
        guard WCSession.isSupported() else {
            print("[WatchBridge] WCSession not supported on this device")
            return
        }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func sendCurrentRecipe(name: String, imageBase64: String) {
        guard canSend() else { return }

        guard let imageData = Data(base64Encoded: imageBase64, options: .ignoreUnknownCharacters),
              let uiImage = UIImage(data: imageData) else {
            print("[WatchBridge] Failed to decode image base64")
            return
        }

        let resized = uiImage.resizedForWatch(maxDimension: 220)
        guard let compressed = resized.jpegData(compressionQuality: 0.5) else {
            print("[WatchBridge] Failed to compress image")
            return
        }

        let payload: [String: Any] = [
            "name": name,
            "imageData": compressed
        ]
        deliver(payload, label: "recipe '\(name)' (\(compressed.count) bytes)")
    }

    func clearCurrentRecipe() {
        guard canSend() else { return }
        deliver(["cleared": true], label: "clear")
    }

    private func deliver(_ payload: [String: Any], label: String) {
        let session = WCSession.default

        if session.isReachable {
            session.sendMessage(payload, replyHandler: nil) { error in
                print("[WatchBridge] sendMessage failed (\(label)): \(error.localizedDescription), falling back to context")
                do {
                    try session.updateApplicationContext(payload)
                    print("[WatchBridge] Fallback context OK (\(label))")
                } catch {
                    print("[WatchBridge] Fallback context failed: \(error.localizedDescription)")
                }
            }
            print("[WatchBridge] Sent via sendMessage: \(label)")
        } else {
            do {
                try session.updateApplicationContext(payload)
                print("[WatchBridge] Sent via applicationContext (not reachable): \(label)")
            } catch {
                print("[WatchBridge] updateApplicationContext failed: \(error.localizedDescription)")
            }
        }
    }

    private func canSend() -> Bool {
        let session = WCSession.default
        guard session.activationState == .activated else {
            print("[WatchBridge] Session not activated yet")
            return false
        }
        guard session.isPaired else {
            print("[WatchBridge] No paired watch")
            return false
        }
        guard session.isWatchAppInstalled else {
            print("[WatchBridge] Watch app not installed")
            return false
        }
        return true
    }

    // MARK: WCSessionDelegate
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("[WatchBridge] Activation error: \(error.localizedDescription)")
        } else {
            print("[WatchBridge] Activated: \(activationState.rawValue), paired: \(session.isPaired), installed: \(session.isWatchAppInstalled)")
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        print("[WatchBridge] Session became inactive")
    }

    func sessionDidDeactivate(_ session: WCSession) {
        print("[WatchBridge] Session deactivated, reactivating")
        WCSession.default.activate()
    }
}

private extension UIImage {
    func resizedForWatch(maxDimension: CGFloat) -> UIImage {
        let longest = max(size.width, size.height)
        guard longest > maxDimension else { return self }
        let ratio = maxDimension / longest
        let newSize = CGSize(width: size.width * ratio, height: size.height * ratio)
        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in
            draw(in: CGRect(origin: .zero, size: newSize))
        }
    }
}
