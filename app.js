const { ref } = Vue;

Vue.createApp({
    setup() {
        return {
            gyro: ref(null),
            gyroData: ref({}),
            msg: ref(""),
        };
    },
    mounted() {
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
                        logger: (...data) => console.log("GyroNorm", ...data),
                        screenAdjusted: false,
                    })
                    .then(() => {
                        this.msg = "GyroNorm initialized";
                        this.gyro.start((data) => {
                            this.gyroData = data;
                        });
                    })
                    .catch((e) => {
                        this.msg = "cannot init GyroNorm " + e;
                    });
            }
        });

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
