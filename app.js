const { ref } = Vue;

const round = Math.round;

Vue.createApp({
    setup() {
        return {
            gyroData: ref({
                beta: 0,
                betaDelayed: 0,
                gamma: 0,
                gammaDelayed: 0,
            }),
            gyroRanges: {
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
                this.gyro.start((data) => {
                    this.gyroData.beta = round(data.do.beta);
                    this.gyroData.gamma = round(data.do.gamma);
                });
            })
            .catch((e) => {
                const ways = {
                    beta: true,
                    gamma: true,
                };
                setInterval(() => {
                    ["beta", "gamma"].forEach((k) => {
                        const step = Math.floor(Math.random()  * 40 + 10)/10;
                        this.gyroData[k] += ways[k] ? step : -step;
                        if (
                            this.gyroData[k] < this.gyroRanges[k].min ||
                            this.gyroData[k] > this.gyroRanges[k].max
                        ) {
                            this.gyroData[k] += ways[k]
                                ? -(step * 2)
                                : step * 2;
                            ways[k] = !ways[k];
                        }
                        this.gyroData[k] = round(this.gyroData[k]);
                    });
                }, 100);
            });
        setInterval(() => {
            const beta = this.gyroData.beta,
                gamma = this.gyroData.gamma;
            setTimeout(() => {
                this.gyroData.betaDelayed = beta;
                this.gyroData.gammaDelayed = gamma;
            }, 1000);
        }, 50);

        ondevicemotion = (e) => {
            this.aclData = e;
        };
    },
    methods: {
        getAvg: function (k) {
            const current = this.gyroData[k];
            const delayed = this.gyroData[k + "Delayed"];
            const min = this.gyroRanges[k].min;
            const max = this.gyroRanges[k].max;
            const range = max - min;
            const middle = (min + max) / 2;
            const margin = range * 0.25;
            const computedDelayed =
                current < min + margin && delayed > middle
                    ? delayed - range
                    : current > max - margin && delayed < middle
                    ? delayed + range
                    : delayed;
            let avg = (current + computedDelayed) / 2;
            return avg + (avg < min ? range : avg > max ? -range : 0);
        },
    },
    template: `
      <div class="w-100 d-flex justify-content-center align-items-center flex-column">
        <div v-html="msg"></div>
        <div class="d-flex flex-column w-100">
            <div class="w-100 d-flex flex-column align-items-center px-5" v-for="k in ['beta', 'gamma']">
                <caption>{{k}}</caption>
                <div class="w-100 bar border">
                    <div class="h-100" :style="{
                        width: ((gyroData[k] - gyroRanges[k].min) / (gyroRanges[k].max - gyroRanges[k].min) * 100) + '%',
                    }"></div>
                </div>
                <div class="w-100 bar border">
                    <div class="h-100" :style="{
                        width: ((getAvg(k) - gyroRanges[k].min) / (gyroRanges[k].max - gyroRanges[k].min) * 100) + '%',
                    }"></div>
                </div>
                <div class="w-100 bar border">
                    <div class="h-100" :style="{
                        width: ((gyroData[k + 'Delayed'] - gyroRanges[k].min) / (gyroRanges[k].max - gyroRanges[k].min) * 100) + '%',
                    }"></div>
                </div>
            </div>
        </div>
      </div>
    `,
}).mount("#app");
