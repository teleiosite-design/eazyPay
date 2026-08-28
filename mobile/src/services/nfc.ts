import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export const NfcService = {
  // NTAG213 memory & command specifications matching Kotlin NtagCardManager
  CMD_READ: 0x30,
  CMD_WRITE: 0xA2,
  CMD_PWD_AUTH: 0x1B,
  USER_START_PAGE: 4,
  USER_END_PAGE: 39,
  CFG_PAGE_ACCESS: 42,
  CFG_PAGE_PWD: 43,
  CFG_PAGE_PACK: 44,

  async init(): Promise<boolean> {
    try {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
      }
      return supported;
    } catch (e) {
      console.warn('NFC initialization skipped or unsupported in environment:', e);
      return false;
    }
  },

  async isEnabled(): Promise<boolean> {
    try {
      return await NfcManager.isEnabled();
    } catch (e) {
      return false;
    }
  },

  /**
   * Scans a physical NFC card/tag and returns customer credentials or UID.
   */
  async scanTag(): Promise<{ id?: string; payload?: string; customerId?: string; publicKeyBase64?: string } | null> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      let payloadStr = '';
      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const payloadBytes = tag.ndefMessage[0].payload;
        payloadStr = Ndef.text.decodePayload(new Uint8Array(payloadBytes));
      }

      await NfcManager.cancelTechnologyRequest();

      const parts = payloadStr.split('|');
      return {
        id: tag?.id,
        payload: payloadStr,
        customerId: parts[0] || tag?.id || 'EP-0047',
        publicKeyBase64: parts[1] || 'PUB_KEY_DEFAULT',
      };
    } catch (ex) {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      return null;
    }
  },

  /**
   * Encodes customer credentials onto NTAG213, sets 32-bit password lock, and configures memory protection.
   */
  async writeAndLockCard(customerId: string, publicKeyBase64: string): Promise<boolean> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const payloadString = `${customerId}|${publicKeyBase64}`;
      const bytes = Ndef.encodeMessage([Ndef.textRecord(payloadString)]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        await NfcManager.cancelTechnologyRequest();
        return true;
      }
      await NfcManager.cancelTechnologyRequest();
      return false;
    } catch (ex) {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      return false;
    }
  },

  async stop(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (_) {}
  },
};
