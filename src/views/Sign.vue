<template>
  <div>
    <h3 class="p-4 border-bottom">New unsigned transaction</h3>
    <div v-if="parsed && uriIsValid" class="p-4">
      <div class="container-sm mx-0">
        <div v-if="!loading && failed" class="flash flash-error mb-4">
          Oops, something went wrong. Please try again later.
        </div>
        <Confirmation v-if="!loading && !!transactionId" :id="transactionId" />
        <div v-if="!failed && !transactionId">
          <div v-for="(operation, key) in parsed.tx.operations" :key="key" class="mb-4">
            <div class="Box">
              <div class="Box-row">
                <h4 class="mb-0">{{ operation[0] }}</h4>
              </div>
              <div class="Box-row">
                <div v-for="(value, key) in operation[1]" :key="key">
                  <p>
                    <b class="form-label">{{ key }}</b>
                    <OperationValue :value="value"/>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="flash flash-warn mb-4" v-if="parsed.params.callback">
            You are going to get redirected to
            <span class="link-color">{{ parsed.params.callback | parseUrl }}</span>.
          </div>
          <div class="mb-4">
            <button
              type="submit"
              class="btn btn-large btn-primary mr-2 mb-2"
              :disabled="loading"
              @click="handleSubmit"
            >
              {{ parsed.params.no_broadcast ? 'Sign' : 'Approve' }}
            </button>
            <button
              type="submit"
              class="btn btn-large btn-danger mb-2"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4" v-else>
      <div class="container-sm mx-0 flash flash-error mb-4">
        Oops, something went wrong. The signing URL provided is invalid.
      </div>
    </div>
  </div>
</template>

<script>
import * as steemuri from 'steem-uri';
import { mapActions } from 'vuex';
import { resolveTransaction } from '@/helpers/client';

export default {
  data() {
    return {
      parsed: null,
      uriIsValid: true,
      loading: false,
      transactionId: '',
      failed: false,
    };
  },
  mounted() {
    this.parseUri(`steem://sign/${this.$route.params[0]}${window.location.search}`);
  },
  methods: {
    ...mapActions(['sign', 'broadcast']),
    parseUri(uri) {
      let parsed;
      try {
        parsed = steemuri.decode(uri);
      } catch (err) {
        this.uriIsValid = false;
        console.error('Failed to decode URI', err);
      }
      this.parsed = parsed;
    },
    async handleSubmit() {
      this.loading = true;
      let sig = null;
      let tx = null;
      let signedTx = null;
      let confirmation = null;

      try {
        tx = await resolveTransaction(this.parsed, this.$store.state.auth.username);
        signedTx = await this.sign(tx);
        [sig] = signedTx.signatures;
      } catch (err) {
        console.error('Failed to resolve and sign transaction', err);
      }

      if (!sig) {
        this.transactionId = '';
        this.failed = true;
        this.loading = false;
        return;
      }

      if (!this.parsed.params.no_broadcast) {
        try {
          confirmation = await this.broadcast(signedTx);
          this.transactionId = confirmation.id;
          this.failed = false;
        } catch (err) {
          console.error('Failed to broadcast transaction', err);
          this.transactionId = '';
          this.failed = true;
        }
      }

      // redirect to the callback if set
      if (this.parsed.params.callback) {
        window.location = steemuri.resolveCallback(this.parsed.params.callback, {
          sig,
          id: confirmation.id || undefined,
          block: confirmation.block_num || undefined,
          txn: confirmation.txn_num || undefined,
        });
      } else {
        this.loading = false;
      }
    },
  },
};
</script>