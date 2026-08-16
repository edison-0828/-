package vip.xiaonuo.zj.modular.viewing.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import vip.xiaonuo.common.pojo.CommonEntity;

import java.time.LocalDate;

@Getter
@Setter
@TableName("ZJ_VIEWING_REQUEST")
public class ZjViewingRequest extends CommonEntity {
    @TableId
    private String id;
    private String listingId;
    private String requesterId;
    private LocalDate preferredDate;
    private String preferredTime;
    private String contactPhone;
    private String message;
    private String status;
}
