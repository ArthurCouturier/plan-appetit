import Capacitor

class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(TikTokSDKPlugin())
        bridge?.registerPluginInstance(SKAdNetworkPlugin())
    }
}
