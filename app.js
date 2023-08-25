const { ref } = Vue;

Vue.createApp({
    setup() {
        return {
            sensors: [],
            aclData: {},
            msg: ref(""),
        };
    },
    mounted() {
        try {
            const perms = ["accelerometer", "magnetometer", "gyroscope"];
            const queries = perms.map((perm) => {
                return navigator.permissions.query({ name: perm });
            });
            Promise.all(queries).then((results) => {
                results.forEach((r, i) => {
                    console.log(perms[i], r);
                    this.msg += `${perms[i]} ${r.state}<br/>`;
                    if (r.state !== "granted") {
                        navigator.permissions.request({
                            name: perms[i],
                        });
                    }
                });
            });
        } catch (e) {
            this.msg = e;
        }

        ondevicemotion = (e) => {
            this.aclData = e;
        };
    },
    template: `
      <div>
        {{sensors}}<br/>
        {{aclData}}<br/>
        <div v-html="msg"></div>
      </div>
    `,
}).mount("#app");
