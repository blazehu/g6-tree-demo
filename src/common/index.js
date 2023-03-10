import G6 from '@antv/g6';


const k8sApiResources = {
    ComponentStatus: 'cs',
    ConfigMap: 'cm',
    Endpoints: 'ep',
    LimitRange: 'limits',
    Namespace: 'ns',
    PersistentVolumeClaim: 'pvc',
    PersistentVolume: 'pv',
    ReplicationController: 'rc',
    ResourceQuota: 'quota',
    ServiceAccount: 'sa',
    Service: 'svc',
    CustomResourceDefinition: 'crd',
    DaemonSet: 'ds',
    Deployment: 'deploy',
    ReplicaSet: 'rs',
    StatefulSet: 'sts',
    Application: 'app',
    ApplicationSet: 'appset',
    AppProject: 'appproj',
    HorizontalPodAutoscaler: 'hpa',
    CronJob: 'cj',
    CertificateSigningRequest: 'csr',
    LogConfig: 'lc',
    Ingress: 'ing',
    NetworkPolicy: 'netpol',
    PodDisruptionBudget: 'pdb',
    PodSecurityPolicy: 'psp',
    Pod: 'pod',
    PriorityClass: 'pc',
    StorageClass: 'sc',
    EndpointSlice: 'endpointslice',
    ControllerRevision: 'controllerrevision'
};

const SyncStatuses = {
    Unknown: 'Unknown',
    Synced: 'Synced',
    OutOfSync: 'OutOfSync',
};

const HealthStatuses = {
    Unknown: 'Unknown',
    Progressing: 'Progressing',
    Suspended: 'Suspended',
    Healthy: 'Healthy',
    Degraded: 'Degraded',
    Missing: 'Missing',
};

export const registerFlowLine = function () {
    G6.registerEdge('flow-line', {
        draw(cfg, group) {
            const {startPoint} = cfg;
            const {endPoint} = cfg;

            const {style} = cfg;
            return group.addShape('path', {
                attrs: {
                    stroke: style.stroke,
                    endArrow: style.endArrow,
                    path: [
                        ['M', startPoint.x, startPoint.y],
                        ['L', (startPoint.x + endPoint.x) / 2, startPoint.y],
                        ['L', (startPoint.x + endPoint.x) / 2, endPoint.y],
                        ['L', endPoint.x, endPoint.y],
                    ],
                },
            });
        },
    });
};

export const registerResourceNode = function () {
    G6.registerNode('resource', {
        // ???????????????????????????
        options: {
            size: [185, 70],
            style: {
                radius: 5,
                stroke: '#69c0ff',
                fill: '#ffffff',
                fillOpacity: 1,
            },
            // ??????????????????
            labelCfg: {
                style: {
                    fill: '#595959',
                    fontSize: 14,
                },
                offset: 60, // ??????????????? offset
                offsetY: 28, // ??????????????? offset
            },
            preRect: {
                show: true,
                width: 4,
                fill: '#40a9ff',
                radius: 2,
            },
            // ?????????icon??????
            logoIcon: {
                // ????????????icon????????? false ????????????icon
                show: true,
                x: 0,
                y: 0,
                width: 32,
                height: 32,
                // ?????????????????????????????????
                offset: 0,
                // ?????????????????????????????????
                offsetY: -7,
                // ???????????????????????????
                title: '',
            },
            // ??????????????????????????????icon??????
            syncIcon: {
                // ????????????icon????????? false ????????????icon
                show: true,
                x: 0,
                y: 0,
                width: 18,
                height: 18,
                // ??????????????? offset
                offset: 96,
            },
            // ??????????????????????????????icon??????
            healthIcon: {
                // ????????????icon????????? false ????????????icon
                show: true,
                x: 0,
                y: 0,
                width: 18,
                height: 18,
                // ??????????????? offset
                offset: 72,
            },
            // ????????????????????????icon??????
            stateIcon: {
                // ????????????icon????????? false ????????????icon
                show: true,
                x: 0,
                y: 0,
                width: 16,
                height: 16,
                // ?????????????????????????????????
                offset: -5,
            },
            // ???????????????????????????
            // anchorPoints: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }]
            anchorPoints: [
                [0, 0.5],
                [1, 0.5],
            ],
        },
        afterDraw: function drawShape(cfg, group) {
            const w = cfg.size[0];
            // set logoIcon
            if (cfg.kind !== 'Helm') {
                cfg.logoIcon = {
                    img: getResourceLogo(cfg.kind),
                    title: cfg.kind,
                };
            }
            const shape = group.addShape('text', {
                attrs: {
                    x: w / 2 - 60,
                    y: 20,
                    textBaseline: 'top',
                    lineHeight: 22,
                    fontSize: 13,
                    data: cfg?.info, // ?????????????????????????????????????????????????????????
                    fill: '#fff',
                    opacity: '0',
                },
                name: 'resource-info',
            });
            // draw
            this.drawLogoIcon(cfg, group);
            this.drawLabel(cfg, group);
            this.drawHealthIcon(cfg, group);
            this.drawSyncIcon(cfg, group);
            if (cfg?.phase === 'StartSync' || cfg?.phase === 'FinishSync') {
                this.drawBackgroundAnimate(cfg, group);
            }
            return shape;
        },
        /**
         * ????????????Tips?????????????????????
         * @param {Object} cfg ???????????????
         * @param {Object} group Group??????
         */
        drawBackgroundAnimate(cfg, group) {
            const w = cfg.size[0];
            const h = cfg.size[1];

            const backShape = 20;
            const shape = group.addShape('rect', {
                zIndex: -3,
                attrs: {
                    x: -w / 2 - backShape / 2,
                    y: -h / 2 - backShape / 2,
                    fill: 'rgba(228,229,229,0.79)',
                    opacity: 0.6,
                    width: cfg.size[0] + backShape,
                    height: cfg.size[1] + backShape,
                    radius: [6, 6],
                },
                name: 'back-shape',
            });
            group.sort();
            shape.animate(
                {
                    x: -w / 2 - backShape,
                    y: -h / 2 - backShape,
                    width: cfg.size[0] + backShape * 2,
                    height: cfg.size[1] + backShape * 2,
                    opacity: 0.3,
                },
                {
                    duration: 1000,
                    easing: 'easeCubic',
                    delay: 0,
                    repeat: true, // repeat
                },
            );
            shape.animate(
                {
                    x: -w / 2 - backShape * 1.5,
                    y: -h / 2 - backShape * 1.5,
                    width: cfg.size[0] + backShape * 3,
                    height: cfg.size[1] + backShape * 3,
                    opacity: 0.1,
                },
                {
                    duration: 1000,
                    easing: 'easeCubic',
                    delay: 500,
                    repeat: true, // repeat
                },
            );
            return shape;
        },
        /**
         * ???????????????????????????logo??????
         * @param {Object} cfg ???????????????
         * @param {Object} group Group??????
         */
        drawLogoIcon(cfg, group) {
            const {logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];
            const height = size[1];

            if (logoIcon.show) {
                const {width: w, height: h, x, y, offset, offsetY, text, title, ...logoIconStyle} = logoIcon;
                if (text) {
                    group.addShape('text', {
                        attrs: {
                            x: 0,
                            y: 0,
                            fontSize: 12,
                            fill: '#000',
                            stroke: '#000',
                            textBaseline: 'middle',
                            textAlign: 'center',
                            cursor: 'pointer',
                            ...logoIconStyle,
                        },
                        className: 'rect-logo-icon',
                        name: 'rect-logo-icon',
                        draggable: true,
                    });
                } else {
                    group.addShape('image', {
                        attrs: {
                            ...logoIconStyle,
                            x: x || -width / 2 + (w) + (offset),
                            y: y || -(h) / 2 + offsetY,
                            width: w,
                            height: h,
                            cursor: 'pointer',
                        },
                        className: 'rect-logo-icon',
                        name: 'rect-logo-icon',
                        draggable: true,
                    });
                }
                if (title) {
                    const titleOffset = -offsetY;
                    let titleOffsetX = 0;
                    const shortName = getShortName(title);
                    if (shortName.length < 5) {
                        titleOffsetX = 7;
                    } else if (shortName.length < 9) {
                        titleOffsetX = -1;
                    } else {
                        titleOffsetX = -12;
                    }
                    group.addShape('text', {
                        attrs: {
                            x: x || -width / 2 + (w) + (offset) + (titleOffsetX),
                            y: y || height / 2 - (titleOffset),
                            text: shortName,
                            fontSize: 13,
                            fontWeight: 400,
                            fill: '#595959',
                            cursor: 'pointer',
                        },
                        name: 'rect-logo-title',
                    });
                }
                if (!logoIcon.img) {
                    group.addShape('circle', {
                        attrs: {
                            x: x || -width / 2 + (w) + 12,
                            y: y || -(h) / 2 + 8,
                            r: 18,
                            fill: '#8FA4B1',
                            cursor: 'pointer',
                        },
                        // must be assigned in G6 3.3 and later versions. it can be any value you want
                        name: 'circle-shape',
                    });
                    group.addShape('text', {
                        attrs: {
                            x: x || -width / 2 + (w) + 4,
                            y: y || -(h) / 2 + 2,
                            textBaseline: 'top',
                            lineHeight: 30,
                            fontSize: 13,
                            text: getLogoShortName(cfg.kind),
                            fill: '#FFF',
                            cursor: 'pointer',
                        },
                        name: 'custom-logo-title',
                    });
                }
            }
        },
        /**
         * ?????????????????????label
         * @param {Object} cfg ???????????????
         * @param {Object} group Group??????
         */
        drawLabel(cfg, group) {
            const {labelCfg = {}, logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];
            const height = size[1];

            let label = null;
            let offsetX = -width / 2 + labelCfg.offset;
            const {show, offsetY, width: w} = logoIcon;
            if (show) {
                offsetX = -width / 2 + (w) + labelCfg.offset;
            }
            const {style: fontStyle} = labelCfg;
            let y = 0;
            if (cfg?.health || cfg?.status) {
                y = -(height) / 2 + labelCfg.offsetY + offsetY + 7;
            } else {
                y = -(height) / 2 + labelCfg.offsetY + offsetY + 16;
            }
            label = group.addShape('text', {
                attrs: {
                    ...fontStyle,
                    x: offsetX,
                    y,
                    text: cfg.label,
                    cursor: 'pointer',
                },
                name: 'resource-name',
                draggable: true,
                labelRelated: true,
            });
            group.shapeMap['resource-name'] = label;
            return label;
        },
        /**
         * ???????????????????????????????????????
         * @param {Object} cfg ???????????????
         * @param {Object} group Group??????
         */
        drawHealthIcon(cfg, group) {
            const {healthIcon = {}, logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];

            if (healthIcon.show && cfg.health) {
                let offsetX = -width / 2 + healthIcon.offset;
                const {show, width: w} = healthIcon;
                if (show) {
                    offsetX = -width / 2 + (w) + healthIcon.offset;
                }
                const {offsetY} = logoIcon;
                const img = getHealthImg(cfg);
                const shape = group.addShape('image', {
                    attrs: {
                        x: offsetX,
                        y: -2 + offsetY + 7,
                        width: 18,
                        height: 18,
                        img,
                        cursor: 'pointer',
                    },
                    className: 'rect-health-icon',
                    name: 'rect-health-icon',
                });
                if (cfg?.health === HealthStatuses.Progressing) {
                    const [imageWidth, imageHeight] = [18, 18] ;
                    shape.animate(
                        (ratio) => {
                            // ??????????????????????????? ratio???????????????????????????Number??????????????????????????????????????????????????????Object??????
                            const { x, y } = shape.attr();
                            const animateX = x + imageWidth / 2;
                            const animateY = y + imageHeight / 2;
                            const matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
                            // ???????????????????????????????????????????????????????????????
                            const newMatrix = G6.Util.transform(matrix, [
                                ['t', -animateX, -animateY],
                                ['r', ratio * Math.PI * 2],
                                ['t', animateX, animateY],
                            ]);
                            return {
                                matrix: newMatrix,
                            };
                        },
                        {
                            repeat: true, // ????????????
                            duration: 1000,
                            easing: 'easeLinear',
                        },
                    );
                }
            }
        },
        /**
         * ???????????????????????????????????????
         * @param {Object} cfg ???????????????
         * @param {Object} group Group??????
         */
        drawSyncIcon(cfg, group) {
            const {syncIcon = {}, healthIcon = {}, logoIcon = {}} = this.getOptions(cfg);
            const size = this.getSize(cfg);
            const width = size[0];

            if (syncIcon.show && cfg.status !== null) {
                let {offset} = syncIcon;
                if (!healthIcon.show || !cfg.health) {
                    offset = healthIcon.offset;
                }
                let offsetX = -width / 2 + offset;
                const {show, width: w} = syncIcon;
                if (show) {
                    offsetX = -width / 2 + (w) + offset;
                }
                const {offsetY} = logoIcon;
                const img = getSyncImg(cfg);
                group.addShape('image', {
                    attrs: {
                        x: offsetX,
                        y: -2 + offsetY + 7,
                        width: 18,
                        height: 18,
                        img,
                        cursor: 'pointer',
                    },
                    className: 'rect-sync-icon',
                    name: 'rect-sync-icon',
                });
            }
        },
    }, 'rect');
};

export const getEdgesLayer = function (edges) {
    const edgesLayer = {};
    edges.forEach((edge) => {
        if (edgesLayer[edge.source]) {
            edgesLayer[edge.source] = append(edgesLayer[edge.source], edge.target);
        } else {
            edgesLayer[edge.source] = [edge.target];
        }
    });
    const layer2 = (edgesLayer['0'] || []).length;
    let layer3 = 0;
    let layer4 = 0;
    (edgesLayer['0'] || []).forEach((v3) => {
        layer3 += (edgesLayer[v3] || []).length;
        (edgesLayer[v3] || []).forEach((v4) => {
            layer4 += (edgesLayer[v4] || []).length;
        });
    });
    return {
        'layer-1': 1,
        'layer-2': layer2,
        'layer-3': layer3,
        'layer-4': layer4,
    };
};

export const unique = function (a) {
    return [...new Set(a)];
};

export const append = function (a, v) {
    return unique([...a, v]);
};

export const getShortName = function (data) {
    return k8sApiResources[data];
};

export const getLogoShortName = function (data) {
    let newString = '';
    const stringArray = data.split('');
    stringArray.forEach((t) => {
        if (/[A-Z]/.test(t)) {
            newString = newString + t;
        }
    });
    return newString;
};

export const getResourceLogo = function (kind) {
    const ResourceIconMap = {
        Service: 'https://blazehu.com/images/k8s/kind/svc.svg',
        Endpoints: 'https://blazehu.com/images/k8s/kind/ep.svg',
        PersistentVolumeClaim: 'https://blazehu.com/images/k8s/kind/pvc.svg',
        Pod: 'https://blazehu.com/images/k8s/kind/pod.svg',
        ConfigMap: 'https://blazehu.com/images/k8s/kind/cm.svg',
        Deployment: 'https://blazehu.com/images/k8s/kind/deploy.svg',
        PersistentVolume: 'https://blazehu.com/images/k8s/kind/pv.svg',
        ReplicaSet: 'https://blazehu.com/images/k8s/kind/rs.svg',
        Secret: 'https://blazehu.com/images/k8s/kind/secret.svg',
        StatefulSet: 'https://blazehu.com/images/k8s/kind/sts.svg',
    };
    return ResourceIconMap[kind] ? ResourceIconMap[kind] : '';
};

export const getSyncImg = function (cfg) {
    let icon = null;
    switch (cfg?.status) {
        case SyncStatuses.Synced:
            icon = 'synced';
            break;
        case SyncStatuses.OutOfSync:
            icon = 'outofsync';
            break;
        case SyncStatuses.Unknown:
            icon = 'unknown';
            break;
    }
    return `https://blazehu.com/images/k8s/status/${icon}.svg`;
};

export const getHealthImg = function (cfg) {
    let icon = '';
    switch (cfg?.health) {
        case HealthStatuses.Healthy:
            icon = 'health';
            break;
        case HealthStatuses.Progressing:
            icon = 'progressing';
            // className = 'icon-spin';
            break;
        case HealthStatuses.Missing:
            icon = 'missing';
            break;
        case HealthStatuses.Degraded:
            icon = 'degraded';
            break;
        case HealthStatuses.Unknown:
            icon = 'unknown';
            break;
        case HealthStatuses.Suspended:
            icon = 'suspended';
            break;
    }
    return `https://blazehu.com/images/k8s/status/${icon}.svg`;
};
