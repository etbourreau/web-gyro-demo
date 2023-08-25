const { ref } = Vue;

const round = Math.round;

Vue.createApp({
    setup() {
        return {
            gyroData: ref({
                alpha: 0,
                beta: 0,
                gamma: 0,
            }),
            msg: ref(""),
        };
    },
    mounted() {
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
                    this.gyroData.alpha = round(data.do.alpha);
                    this.gyroData.beta = round(data.do.beta);
                    this.gyroData.gamma = round(data.do.gamma);
                });
            })
            .catch((e) => {
                let aWay = true,
                    bWay = true,
                    gWay = true;
                const step = 2;
                setInterval(() => {
                    this.gyroData.alpha += step * (aWay ? 1 : -1) * 0.37;
                    if (this.gyroData.alpha < 0 || this.gyroData.alpha > 360) {
                        this.gyroData.alpha += aWay ? -step : step;
                        aWay = !aWay;
                    }
                    this.gyroData.beta += step * (bWay ? 1 : -1) * 0.98;
                    if (this.gyroData.beta < 0 || this.gyroData.beta > 360) {
                        this.gyroData.beta += bWay ? -step : step;
                        bWay = !bWay;
                    }
                    this.gyroData.gamma += step * (gWay ? 1 : -1) * 1.71;
                    if (this.gyroData.gamma < 0 || this.gyroData.gamma > 360) {
                        this.gyroData.gamma += gWay ? -step : step;
                        gWay = !gWay;
                    }
                    ["alpha", "beta", "gamma"].forEach((e) => {
                        this.gyroData[e] = round(this.gyroData[e]);
                    });
                }, 100);
            });

        ondevicemotion = (e) => {
            this.aclData = e;
        };
    },
    template: `
      <div class="w-100 d-flex justify-content-center align-items-center flex-column">
        <div v-html="msg"></div>
        <div class="d-flex flex-column w-100">
            <div class="w-100 d-flex flex-column align-items-center px-5" v-for="k in ['alpha', 'beta', 'gamma']">
                <caption>{{k}}</caption>  
                <div class="w-100 bar border">
                    <div class="h-100" :style="{
                        width: (gyroData[k] / 360 * 100) + '%',
                    }"></div>
                </div>
            </div>
        </div>
      </div>
    `,
}).mount("#app");
