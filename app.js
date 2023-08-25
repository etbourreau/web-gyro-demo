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
                    this.gyro = new GyroNorm();
                    this.gyro
                        .init({
                            frequency: 30,
                            gravityNormalized: true,
                            orientationBase: GyroNorm.GAME,
                            decimalCount: 2,
                            logger: (...data) =>
                                console.log("GyroNorm", ...data),
                            screenAdjusted: false,
                        })
                        .then((data) => {
                            this.gyroData = data.do;
                        })
                        .catch((e) => {
                            this.msg ="cannot init GyroNorm " + e;
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
