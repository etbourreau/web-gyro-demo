const { ref } = Vue;

Vue.createApp({
    setup() {
        return {
            sensors: [],
            gyro: null,
            gyroData: {},
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
                if (results.every((result) => result.state === "granted")) {
                    gyro.startTracking(function (o) {
                        this.gyroData = {
                            alpha: o.alpha,
                            beta: o.beta,
                            gamma: o.gamma,
                        };
                    });
                }
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
        {{gyro}}<br/>
        {{JSON.stringify(gyroData)}}<br/>
        <div v-html="msg"></div>
      </div>
    `,
}).mount("#app");
