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
            gyroRanges: {
                alpha: {
                    min: 0,
                    max: 360,
                },
                beta: {
                    min: -180,
                    max: 180,
                },
                gamma: {
                    min: -90,
                    max: 90,
                },
            },
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
                const ways = {
                    alpha: true,
                    beta: true,
                    gamma: true,
                };
                setInterval(() => {
                    ["alpha", "beta", "gamma"].forEach((k) => {
                        this.gyroData[k] += ways[k] ? 1 : -1;
                        if (
                            this.gyroData[k] < this.gyroRanges[k].min ||
                            this.gyroData[k] > this.gyroRanges[k].max
                        ) {
                            this.gyroData[k] += ways[k] ? -2 : 2;
                            ways[k] = !ways[k];
                        }
                        this.gyroData[k] = round(this.gyroData[k]);
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
                        width: ((gyroData[k] - gyroRanges[k].min) / (gyroRanges[k].max - gyroRanges[k].min) * 100) + '%',
                    }"></div>
                </div>
            </div>
        </div>
      </div>
    `,
}).mount("#app");
